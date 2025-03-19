import Roles from '../models/Roles.js';
import { successResponse, errorResponse } from '../helpers/ResponseHandler.js';

export const index = async (req, res) => {
    try {
        const { page = 1, perPage = 10, search = "" } = req.query;
        const pageNumber    = parseInt(page, 10);
        const perPageNumber = parseInt(perPage, 10);

        const query = search ? { name: new RegExp(search, "i") } : {};

        const roles = await Roles.aggregate([
            { $match: query },
            { $sort: { _id: -1 } },
            { $skip: (pageNumber - 1) * perPageNumber },
            { $limit: perPageNumber },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    createdAt: {
                        $dateToString: { format: "%d %b, %Y", date: "$createdAt" }
                    }
                }
            }
        ]);

        const total = await Roles.countDocuments(query);
        successResponse(res, { roles, total });
    } catch (error) {
        console.log(error.message)
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
};

export const create = async (req, res) => {
    try {
        const { roleId, name } = req.body;
        let message = 'Role Created Successfully';

        const existingRole = await Roles.findOne({
            name: { $regex: `^${name}$`, $options: "i" },
            ...(roleId && { _id: { $ne: roleId } })
        });

        if (existingRole) {
            return errorResponse(res, "Role name already exists", null, 400);
        }

        if (roleId) {
            const updatedRole = await Roles.findByIdAndUpdate(roleId, req.body, { new: true });

            if (!updatedRole) {
                return errorResponse(res, "Role not found", null, 404);
            }

            message = 'Role Updated Successfully';
        } else {
            const role = new Roles(req.body);
            await role.save();
        }

        successResponse(res, {}, 200, message);
    } catch (error) {
        // console.log(error.message)
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const edit = async (req, res) => {
    try{
        const { id } = req.params;
        
        const role = await Roles.findById(id);
        if(!role) {
            return errorResponse(res,'Role not found!', null, 404);
        }
    
        successResponse(res, role, 200, '');
    } catch (error) {
        // console.log(error.message);
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}

export const destroy = async (req, res) => {
    try {
        const { id } = req.body;
        
        await Roles.delete({_id:id})
        successResponse(res, {}, 200, "Role Deleted Successfully");
    }catch(error){
        // error.message
        errorResponse(res, process.env.ERROR_MSG, error, 500);
    }
}


