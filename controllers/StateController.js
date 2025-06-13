import State from "../models/State.js";
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

export const getState = async (req, res) => {
  try {
    const countryId = req.params.countryId; 
    const states = await State.find({ countryId }).sort({ name : 1 });
    return successResponse(res, states, 200, "States fetched successfully");
  } catch (error) {
    return errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};


export const createState = async (req, res) => {
    try {
     const {state , countryId} = req.body
        const newState = new State({
          name: state,
          countryId})
        await newState.save();countryId
        return successResponse(res, newState, 201, "State created successfully");
      }
       catch (error) {
      return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
  };



export const editState = async (req, res) => {
    try {
      const { stateId, state, countryId } = req.body;
      if (!stateId) {
        return errorResponse(res, "State not found", null, 404);
      }
        await State.findByIdAndUpdate(
          stateId,
          { name: state, countryId },
          { new: true }
        );
        return successResponse(res, {} , 200, "State updated successfully");
      }
      catch (error) {
      return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


export const destroy = async (req, res) => {
    try {
      const { stateId } = req.body;
  
      if (!stateId) {
        return errorResponse(res, "State ID is required", null, 400);
      }
  
      const deletedState = await State.findByIdAndDelete(stateId);
  
      if (!deletedState) {
        return errorResponse(res, "State not found", null, 404);
      }
  
      return successResponse(res, {}, 200, "State deleted successfully");
    } catch (error) {
      return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
  };
  
