const axios = require('axios');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./Models/User'); // Import your User model

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://lgtv29359:yHija1fM0rtnt70o@cluster0.vyvzwrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Function to fetch data from the API
const fetchMediators = async () => {
  try {
    const response = await axios.get('https://api.justact.co.in/system-configs?role=agent'); 
    console.log(response.data.systemConfig.mediatorsInfo)
    const mediatorsInfo = response.data.systemConfig.mediatorsInfo; // Adjust according to your API response

    // Loop through each mediator and save to DB
    for (let mediator of mediatorsInfo) {
      const {
        name,
        image,
        location,
        chronicles,
        qualification,
        languagesKnown,
        otherInterests,
        areasOfExpertise,
        lastHeldPosition,
        yearsOfExperience,
        affiliatedOrganisation,
      } = mediator;

      // Generate random data for missing fields
      const randomEmail = faker.internet.email();
      const randomPassword = faker.internet.password();

      // Prepare data to save
      const userData = {
        name,
        email: randomEmail,  // Use random email for now
        password: randomPassword,  // Use a random password or hash one if required
        role: 'mediator', // Assign 'mediator' role by default
        image: image || faker.image.avatar(),  // Use provided image or random avatar
        location: location || faker.location.city(),
        chronicles: chronicles || faker.lorem.paragraph(),
        qualification: qualification || faker.person.jobTitle(),
        languagesKnown: languagesKnown.join(', ') || faker.helpers.arrayElement(['English', 'Tamil', 'Hindi']),
        otherInterests: otherInterests || faker.lorem.sentence(), 
        areasOfExpertise: areasOfExpertise || faker.person.jobArea(),
        lastHeldPosition: lastHeldPosition || faker.person.jobTitle(),
        yearsOfExperience: yearsOfExperience || faker.number.int({ min: 1, max: 40 }),
        affiliatedOrganisation: affiliatedOrganisation || faker.company.name(),
      };

      // Save to MongoDB
      try {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`Saved mediator: ${name}`);
      } catch (err) {
        console.error('Error saving user:', err);
      }
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }
};

// Run the automation
const runAutomation = async () => {
  await connectDB();
  await fetchMediators();
  mongoose.connection.close(); // Close the DB connection after task completion
};

runAutomation();
