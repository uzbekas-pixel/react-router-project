// src/utils/rewardSystem.js
import { 
  doc, 
  addDoc, 
  collection, 
  serverTimestamp, 
  runTransaction,
  increment 
} from "firebase/firestore";
import { db } from "../firebase/config";

// Constants for currency types to prevent typos
export const CURRENCY = {
  COINS: 'coins',
  XP: 'xp',
  GEMS: 'gems'
};

/**
 * Safely increments a numeric value in a Firestore document using transactions.
 * This ensures atomic updates and prevents race conditions.
 * 
 * @param {string} userId - User ID
 * @param {string} amount - Amount to add (can be negative for spending)
 * @param {string} currency - 'coins', 'xp', or 'gems'
 * @param {string} title - Title for the history entry
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const giveReward = async (userId, amount, currency, title) => {
  if (!userId || !amount || amount === 0) {
    console.warn('[giveReward] Invalid parameters:', { userId, amount, currency });
    return false;
  }

  // Validate currency
  const validCurrencies = Object.values(CURRENCY);
  if (!validCurrencies.includes(currency)) {
    console.error(`[giveReward] Invalid currency: ${currency}. Must be one of: ${validCurrencies.join(', ')}`);
    return false;
  }

  try {
    // Use transaction for atomic updates, especially for XP which updates multiple docs
    await runTransaction(db, async (transaction) => {
      // 1. Handle Coin updates
      if (currency === CURRENCY.COINS) {
        const walletRef = doc(db, "users", userId, "data", "wallet");
        const walletDoc = await transaction.get(walletRef);
        
        const currentCoins = walletDoc.exists() ? (walletDoc.data().coins || 0) : 0;
        const newCoins = Math.max(0, currentCoins + amount); // Prevent negative balance
        
        transaction.set(walletRef, { 
          coins: newCoins,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } 
      // 2. Handle XP updates (atomic update across multiple docs)
      else if (currency === CURRENCY.XP) {
        const statsRef = doc(db, "users", userId, "data", "stats");
        const mainRef = doc(db, "users", userId);
        
        // Read both documents within the transaction
        const [statsDoc, mainDoc] = await Promise.all([
          transaction.get(statsRef),
          transaction.get(mainRef)
        ]);
        
        // Calculate new XP values
        const currentStatsXp = statsDoc.exists() ? (statsDoc.data().xp || 0) : 0;
        const currentMainXp = mainDoc.exists() ? (mainDoc.data().xp || 0) : 0;
        
        const newXp = currentStatsXp + amount;
        
        // Both updates happen atomically - either both succeed or both fail
        transaction.set(statsRef, { 
          xp: newXp,
          lastUpdated: serverTimestamp()
        }, { merge: true });
        
        transaction.set(mainRef, { 
          xp: currentMainXp + amount,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      }
      // 3. Handle Gems updates (placeholder for future)
      else if (currency === CURRENCY.GEMS) {
        const gemsRef = doc(db, "users", userId, "data", "gems");
        const gemsDoc = await transaction.get(gemsRef);
        
        const currentGems = gemsDoc.exists() ? (gemsDoc.data().count || 0) : 0;
        const newGems = Math.max(0, currentGems + amount);
        
        transaction.set(gemsRef, { 
          count: newGems,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      }
    });

    // 4. Add history entry (separate from transaction - not critical)
    // This is done outside the transaction to avoid blocking on history writes
    try {
      const historyRef = collection(db, "users", userId, "history");
      await addDoc(historyRef, {
        title: title || 'Unknown reward',
        amount: Math.abs(amount),
        currency: currency,
        type: amount > 0 ? "earn" : "spend",
        date: serverTimestamp()
      });
    } catch (historyError) {
      // History entry is not critical - log but don't fail the whole operation
      console.warn('[giveReward] Failed to write history entry:', historyError);
    }

    console.log(`[giveReward] Successfully granted ${amount} ${currency} to user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('[giveReward] Transaction failed:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      console.error('[giveReward] Firestore permission denied. Check security rules.');
    } else if (error.code === 'not-found') {
      console.error('[giveReward] Document not found. User may not exist.');
    } else if (error.code === 'unavailable') {
      console.error('[giveReward] Firestore unavailable. Network issue?');
    }
    
    return false;
  }
};

/**
 * Batch grant rewards to multiple users (e.g., for tournament prizes)
 * Uses batched writes for efficiency
 * 
 * @param {Array} rewards - Array of {userId, amount, currency, title}
 * @returns {Promise<{success: number, failed: number}>}
 */
export const giveBatchRewards = async (rewards) => {
  if (!Array.isArray(rewards) || rewards.length === 0) {
    return { success: 0, failed: 0 };
  }

  // Process in parallel with concurrency limit
  const concurrencyLimit = 5;
  const results = { success: 0, failed: 0 };

  for (let i = 0; i < rewards.length; i += concurrencyLimit) {
    const batch = rewards.slice(i, i + concurrencyLimit);
    const promises = batch.map(r => 
      giveReward(r.userId, r.amount, r.currency, r.title)
        .then(success => {
          if (success) results.success++;
          else results.failed++;
        })
    );
    
    await Promise.all(promises);
  }

  console.log(`[giveBatchRewards] Completed: ${results.success} success, ${results.failed} failed`);
  return results;
};