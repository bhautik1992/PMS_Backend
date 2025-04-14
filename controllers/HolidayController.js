import Holiday from "../models/Holiday.js";
import { successResponse, errorResponse } from "../helpers/ResponseHandler.js";

export const create = async (req, res) => {
  try {
    await new Holiday(req.body).save();
    successResponse(res, {}, 200, "Holiday created succesfully");

  } catch (error) {
    console.log(e.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const getHoliday = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = search ? { name: new RegExp(search, "i") } : {};

    const Holidays = await Holiday.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } }, // newest first
      {
        $project: {
          _id: 1,
          name: 1,
          start_date: {
            $dateToString: { format: "%d %b, %Y", date: "$start_date" },
          },
          end_date: {
            $dateToString: { format: "%d %b, %Y", date: "$end_date" },
          },
          createdAt: {
            $dateToString: { format: "%d %b, %Y", date: "$createdAt" },
          },
        },
      },
    ]);

    const total = Holidays.length;

    successResponse(res, { Holidays, total });
  } catch (error) {
    console.log(error.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedHoliday = await Holiday.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedHoliday) {
      return errorResponse(res, "Holiday not found", {}, 404);
    }

    successResponse(res, updatedHoliday, 200, "Holiday updated successfully");
  } catch (error) {
    console.log(error.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};


export const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Holiday.delete({_id:id})
        return successResponse(res, {}, 200, "Holiday Deleted Successfully");
    }catch(error){
        // error.message
        return errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


