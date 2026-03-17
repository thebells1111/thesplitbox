import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// process.cwd() ensures we are looking at the project root
const DATA_DIR = path.join(process.cwd(), "events");
const MASTER_LIST_PATH = path.join(DATA_DIR, "events.json");

export const createEvent = async (req, res) => {
  try {
    const name = req.query.name || "New Event";
    const guid = randomUUID();

    // 1. Ensure the /events data directory exists
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    // 2. Update the master events.json list
    let masterList = [];
    try {
      const data = await fs.readFile(MASTER_LIST_PATH, "utf-8");
      masterList = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, start fresh
    }

    const newEntry = { guid, name };
    masterList.push(newEntry);
    await fs.writeFile(MASTER_LIST_PATH, JSON.stringify(masterList, null, 2));

    // 3. Create the individual [guid].json detail file
    const eventDetails = {
      guid,
      name,
      blocks: [],
      valueBlock: []
    };
    
    await fs.writeFile(
      path.join(DATA_DIR, `${guid}.json`), 
      JSON.stringify(eventDetails, null, 2)
    );

    res.status(201).json({ message: "Event created", event: newEntry });
  } catch (error) {
    res.status(500).json({ error: "Failed to create event." });
  }
};

// READ: Get the master list or a specific event
export const getEvents = async (req, res) => {
    try {
      const { guid } = req.query;
      
      if (guid) {
        // Return specific event details
        const detailPath = path.join(DATA_DIR, `${guid}.json`);
        const data = await fs.readFile(detailPath, "utf-8");
        return res.json(JSON.parse(data));
      } else {
  
      // Return the master list
      const data = await fs.readFile(MASTER_LIST_PATH, "utf-8");
      res.json(JSON.parse(data));
      }
    } catch (error) {
      res.status(404).json({ error: "Event(s) not found." });
    }
  };
  
  // UPDATE: Modify the name or data blocks
  export const updateEvent = async (req, res) => {
    try {
      const { guid, name, blocks, valueBlock } = req.body;
      if (!guid) return res.status(400).json({ error: "GUID is required." });
  
      const detailPath = path.join(DATA_DIR, `${guid}.json`);
      const data = await fs.readFile(detailPath, "utf-8");
      let event = JSON.parse(data);
  
      // Update fields if provided
      if (name) event.name = name;
      if (blocks) event.blocks = blocks;
      if (valueBlock) event.valueBlock = valueBlock;
  
      await fs.writeFile(detailPath, JSON.stringify(event, null, 2));
  
      // If name changed, update the master list too
      if (name) {
        const masterData = await fs.readFile(MASTER_LIST_PATH, "utf-8");
        let masterList = JSON.parse(masterData);
        const idx = masterList.findIndex(e => e.guid === guid);
        if (idx !== -1) {
          masterList[idx].name = name;
          await fs.writeFile(MASTER_LIST_PATH, JSON.stringify(masterList, null, 2));
        }
      }
  
      res.json({ message: "Event updated successfully", event });
    } catch (error) {
      res.status(500).json({ error: "Failed to update event." });
    }
  };
  
  // DELETE: Remove from master list and delete the file
  export const deleteEvent = async (req, res) => {
    try {
      const { guid } = req.query;
      if (!guid) return res.status(400).json({ error: "GUID is required." });
  
      // 1. Remove from master list
      const masterData = await fs.readFile(MASTER_LIST_PATH, "utf-8");
      let masterList = JSON.parse(masterData);
      masterList = masterList.filter(e => e.guid !== guid);
      await fs.writeFile(MASTER_LIST_PATH, JSON.stringify(masterList, null, 2));
  
      // 2. Delete the individual file
      await fs.unlink(path.join(DATA_DIR, `${guid}.json`));
  
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event." });
    }
  };