import { Request, Response } from "express";
import SingletonSettings from "../models/settings.model";

// Controller to get the singleton settings
export const getSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await SingletonSettings.findOne({ _id: "singleton" });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to update the singleton settings
export const updateSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedSettings = req.body;

    const settings = await SingletonSettings.findOneAndUpdate(
      { _id: "singleton" },
      { $set: { settings: updatedSettings } },
      { new: true, runValidators: true }
    );

    res.status(200).json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
