import connectDB from '../../config/database.js';
import dotenv from 'dotenv';
import { rolesTable } from './RolesTableSeeder.js';
import { permissionsTable } from './PermissionsTableSeeder.js';
import { rolePermissionsTable } from './RolePermissionsTableSeeder.js';
import { usersTable } from './UsersTable.js';
import { bankDetailsTable } from './BankDetailsTable.js';
import { settingTable } from './SettingsTable.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        await rolesTable();
        await permissionsTable();
        await rolePermissionsTable();
        await usersTable();
        await bankDetailsTable();
        await settingTable();

        console.log("Seeder executed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();

