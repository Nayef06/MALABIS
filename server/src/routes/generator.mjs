import { Router } from "express";
import { ClothingItem } from "../models/clothingItem.mjs";
import { User } from "../models/user.mjs";

const router = Router();

// Generate an outfit based on selected clothing types
router.post("/api/generator/generate", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  
  const { selectedTypes, lockedItems = [], accessoryCount = 0 } = req.body;
  
  if (!Array.isArray(selectedTypes)) {
    return res.status(400).json({ error: "selectedTypes must be an array" });
  }

  try {
    // Get user's inventory
    const user = await User.findById(req.user._id);
    const inventory = await ClothingItem.find({ _id: { $in: user.inventory } });
    
    // Group items by type
    const itemsByType = inventory.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {});
    
    // Get locked items that should be preserved
    const lockedItemsData = inventory.filter(item => lockedItems.includes(item._id.toString()));
    
    // Define the order: hat, jacket, shirt, pants, shoes
    const itemOrder = ['hat', 'jacket', 'shirt', 'pants', 'shoes'];
    
    // Generate outfit by selecting one random item from each selected type in order
    const generatedOutfit = [];
    const missingTypes = [];
    
    for (const type of itemOrder) {
      // Skip if this type wasn't selected
      if (!selectedTypes.includes(type)) continue;
      
      // Check if we already have a locked item of this type
      const lockedItemOfType = lockedItemsData.find(item => item.type === type);
      if (lockedItemOfType) {
        generatedOutfit.push(lockedItemOfType);
        continue;
      }
      
      if (itemsByType[type] && itemsByType[type].length > 0) {
        // Randomly select an item from this type (excluding locked items)
        const availableItems = itemsByType[type].filter(item => 
          !lockedItems.includes(item._id.toString())
        );
        
        if (availableItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableItems.length);
          generatedOutfit.push(availableItems[randomIndex]);
        } else {
          missingTypes.push(type);
        }
      } else {
        missingTypes.push(type);
      }
    }
    
    // Generate accessories if requested
    if (accessoryCount > 0 && itemsByType['accessory'] && itemsByType['accessory'].length > 0) {
      // Add locked accessories first
      const lockedAccessories = lockedItemsData.filter(item => item.type === 'accessory');
      lockedAccessories.forEach(item => generatedOutfit.push(item));

      // Only fill remaining slots with random unlocked accessories
      const availableAccessories = itemsByType['accessory'].filter(item => 
        !lockedItems.includes(item._id.toString())
      );
      // How many more accessories do we need?
      const remaining = Math.min(accessoryCount, 5) - lockedAccessories.length;
      if (remaining > 0) {
        const maxAccessoriesToGenerate = Math.min(remaining, availableAccessories.length);
        for (let i = 0; i < maxAccessoriesToGenerate; i++) {
          const randomIndex = Math.floor(Math.random() * availableAccessories.length);
          generatedOutfit.push(availableAccessories[randomIndex]);
          availableAccessories.splice(randomIndex, 1);
        }
      }
    }
    
    res.json({
      outfit: generatedOutfit,
      missingTypes,
      success: generatedOutfit.length > 0
    });
    
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router; 