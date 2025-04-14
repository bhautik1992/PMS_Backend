import { successResponse, errorResponse } from "../helpers/ResponseHandler.js";
import Country from "../models/Country.js";

export const createCountry = async (req, res) => {
  try {
    const newCountry = await new Country(req.body).save();
    successResponse(res, newCountry, 200, "Country Created Successfully");
  } catch (error) {
    console.log(error.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const getCountries = async (req, res) => {
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
    console.log(error.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Country.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return errorResponse(res, "Country not found", {}, 404);
    }

    successResponse(res, { updated }, 200, "Country updated successfully");
  } catch (error) {
    console.log(error.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};

export const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    await Country.delete({ _id: id });
    return successResponse(res, {}, 200, "Country deleted successfully");
  } catch (error) {
    console.log(error.message);
    errorResponse(res, process.env.ERROR_MSG, error, 500);
  }
};
