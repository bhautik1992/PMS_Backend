import { successResponse, errorResponse } from "../helpers/ResponseHandler.js";
import Country from "../models/Country.js";
import mongoose from "mongoose";

export const index = async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);

    const query = search ? { name: new RegExp(search, "i") } : {};

    const countries = await Country.aggregate([
      { $match: query },
      { $sort: { _id: -1 } },
      { $skip: (pageNumber - 1) * perPageNumber },
      { $limit: perPageNumber },
      {
        $project: {
          _id: 1,
          name: 1,
          code: 1,
          currency: 1,
          symbol: 1,
          createdAt: {
            $dateToString: { format: "%d %b, %Y", date: "$createdAt" },
          },
        },
      },
    ]);

    const total = await Country.countDocuments(query);
    successResponse(res, { countries, total });
  } catch (error) {
    // console.log(error.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const create = async (req, res) => {
  try {
    let message = "Country Created Succesfully";
    const { countryId } = req.body;

    if (countryId) {
      const updatedCountry = await Country.findByIdAndUpdate(
        countryId,
        req.body,
        { new: true }
      );

      if (!updatedCountry) {
        return errorResponse(res, "Country not found", null, 404);
      }

      message = "Country Updated Successfully";
    } else {
      await new Country(req.body).save();
    }

    successResponse(res, {}, 200, message);
  } catch (error) {
    // console.log(e.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const edit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, process.env.NO_RECORD, null, 400);
    }

    const country = await Country.findById(id);
    if (!country) {
      return errorResponse(res, process.env.NO_RECORD, null, 404);
    }
    return successResponse(res, country, 200, "");
 
  } catch (error) {
    // console.log(error.message);
    return errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.body;

    await Country.delete({ _id: id });
    return successResponse(res, {}, 200, "Country Deleted Successfully");
  } catch (error) {
    // error.message
    return errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};
