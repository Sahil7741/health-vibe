// Required Librarys Imported
import { connect as _connect } from "mongoose";
import { config } from "dotenv";

// Brings Environment Variable form .env file into Runtime Environment
config();

// Asynchronous function to Connect Database
const connectDb = async () => {
  try {
    // Attempt to connect MongoDB using Mongoose
    const connect = await _connect(process.env.URI);

    // If connection is sucessful, log connection details
    console.log(
      "\nMongoDb Connected: ",
      connect.connection.host, // Host
      connect.connection.name // Name of Database
    );
    return true;
  } catch (err) {
    // In case of Error 
    console.log(err);
    return false;
  }
};

// Export connectDb function
export default connectDb;
