import connectDB from "../../config/database.js";
import dotenv from "dotenv";
import { rolesTable } from "./RolesTableSeeder.js";
import { permissionsTable } from "./PermissionsTableSeeder.js";
import { rolePermissionsTable } from "./RolePermissionsTableSeeder.js";
import { usersTable } from "./UsersTable.js";
import { bankDetailsTable } from "./BankDetailsTable.js";
import { settingTable } from "./SettingsTable.js";
import { designationTable } from "./DesignationTableSeeder.js";
import { banksTable } from "./BanksTableSeeder.js";
import { clientsTable } from "./ClientsTableSeeder.js";
import { projectsTable } from "./ProjectsTableSeeder.js";
import { countryTable } from "./CountriesTableSeeder.js";
import { HolidayTable } from "./HolidaySeeder.js";
import { stateTable } from "./StateTableSeeder.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // await rolesTable();         
    // await permissionsTable();
    // await rolePermissionsTable();  
    // await designationTable();
    // await banksTable();
    // await countryTable();
    // await HolidayTable();
    // await stateTable()
    // await settingTable();
    // await clientsTable();
    // await projectsTable();
    // await bankDetailsTable();
    // await usersTable();         
    
    

    console.log("Seeder executed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
