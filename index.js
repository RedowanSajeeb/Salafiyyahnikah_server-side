const express = require("express");
const app = express();
const cors = require("cors");

// const bodyParser = require("body-parser");
const globals = require("node-global-storage");
const axios = require("axios");

const { v4: uuidv4 } = require("uuid");
const generateUniqueId = require("generate-unique-id");

require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 1933;

// middleware
app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.PRIVATE_UsEmail}:${process.env.PRIVATE_MongoCode}@cluster0.muyrflp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const usersDataInDniBya = client
  .db("UsersData")
  .collection("usersRegistration&usersLogin");

const biodataAllInfoPage1 = client
  .db("Biodata")
  .collection("AllusersInformation");

const biodataAllInfoPage2 = client.db("Biodata").collection("Address");

const biodataAllInfoPage3 = client
  .db("Biodata")
  .collection("EducationalQualification");
const biodataAllInfoPage4 = client
  .db("Biodata")
  .collection("FamilyInformation");
const biodataAllInfoPage5 = client
  .db("Biodata")
  .collection("PersonalInformation");
const biodataAllInfoPage6 = client
  .db("Biodata")
  .collection("ProfessionalInformation");
const biodataAllInfoPage7 = client
  .db("Biodata")
  .collection("MarriageInformation");
const biodataAllInfoPage8 = client.db("Biodata").collection("ExpectedPartner");
const biodataAllInfoPage9 = client.db("Biodata").collection("Commitment");
const biodataAllInfoPage10 = client.db("Biodata").collection("Communication");
const allBidataSubmitdb = client.db("Biodata").collection("@allBidataSubmit");
const userShortList = client.db("Short&IgnoreList").collection("UserShortList");
const userIgnorList = client.db("Short&IgnoreList").collection("UserIgnorList");
const report = client.db("reportBiodata").collection("UserReport");
const notificationPostDB = client.db("notificationPost").collection("NotyPost");
const contactInformationDB = client
  .db("ContactInformation")
  .collection("ContactInfoBio");
const connection = client.db("connection").collection("connectionPac");
const bkashBD = client.db("PayInfo").collection("PaymentBkash");
const bkAshPayConationCount = client
  .db("connection")
  .collection("CountsBPayConation");
const totalSuccessfulMarriages = client
  .db("TotalSuccessfulMarry")
  .collection("Marriages");
const popup = client.db("popup").collection("popupjson");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // User registration and login process in the server

    app.get("/alInsUserInfo", async (req, res) => {
      const result = await usersDataInDniBya.find().toArray();
      res.send(result);
    });
    // --
    app.get("/user-by-gmail", async (req, res) => {
      const userEmail = req.query.email;
      const query = { email: userEmail };
      // console.log(query);
      // console.log(userEmail);
      const result = await usersDataInDniBya.findOne(query);
      res.send(result);
    });
    // findUsersByGoogle
    app.get("/google-provider-only", async (req, res) => {
      try {
        const userEmail = req.query.gmail;
        const query = { email: userEmail };
        // console.log(query);

        const result = await usersDataInDniBya.findOne(query);
        // console.log(result);

        if (result && result.provider === "google2") {
          res.send({ messageCode: 200 });
        } else {
          res.send({ messageCode: 404, message: "User not found" });
        }
      } catch (error) {
        console.error("Error finding user:", error);
        res
          .status(500)
          .send({ messageCode: 500, message: "Internal Server Error" });
      }
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };

      const existingUser = await usersDataInDniBya.findOne(query);
      if (existingUser) {
        return res.send({
          message: ` ${
            user.name ? user.name : "This"
          } already exists in the deenibya database`,
        });
      }
      const result = await usersDataInDniBya.insertOne(user);
      res.send(result);
    });

    app.patch("/user-google-by-data-edit", async (req, res) => {
      const userEmail = req.query.email; // Extract email from query parameter
      const { provider, displayName, gender, phoneNumber } = req.body; // Extract updated user data from the request body
      console.log(userEmail);
      const filter = { email: userEmail };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          provider: provider,
          displayName: displayName,
          gender: gender,
          phoneNumber: phoneNumber,
        },
      };
      const result = await usersDataInDniBya.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // ?---biodata--save-and-Edit in the deenibya database-10pages

    // ? BiodatainfoPage1
    app.get("/userByEmailbiodata", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage1.find(query).toArray();

      res.send(resust);
    });

    app.post("/userBiodataGeneralInformation", async (req, res) => {
      const generalInformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage1.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already general information added`,
        });
      }

      const result = await biodataAllInfoPage1.insertOne(generalInformation);
      res.send(result);
    });

    // ----- generalInformationUpdate
    app.put("/userBiodataGeneralInformation", async (req, res) => {
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        TypeofBiodata,
        MaritalStatus,
        BirthYear,
        Height,
        Complexion,
        Weight,
        BloodGroup,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(TypeofBiodata && { TypeofBiodata }),
        ...(MaritalStatus && { MaritalStatus }),
        ...(BirthYear && { BirthYear }),
        ...(Height && { Height }),
        ...(Complexion && { Complexion }),
        ...(Weight && { Weight }),
        ...(BloodGroup && { BloodGroup }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage1.updateOne(filter, updateDoc);

      res.send(result);
    });

    //? Address-biodataInfo-02

    app.get("/userBiodataAddressInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage2.find(query).toArray();

      res.send(resust);
    });

    app.post("/userBiodataAddressInformation", async (req, res) => {
      const addressformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage2.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage2.insertOne(addressformation);
      res.send(result);
    });

    // edit and update
    app.put("/userBiodataAddressInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        permanentAddressDivishionName,
        permanentAddressDistrictNameName,
        permanentAddressUPZilaName,
        currentAddressDivishionName,
        currentAddressDistrictsName,
        currentAddressUpzilaName,
        whereGrowUpLocationName,
        Justwritethenameofthevillage,
        Justwritethenameofthevillage2,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(permanentAddressDivishionName && {
          permanentAddressDivishionName,
        }),
        ...(permanentAddressDistrictNameName && {
          permanentAddressDistrictNameName,
        }),
        ...(permanentAddressUPZilaName && { permanentAddressUPZilaName }),
        ...(currentAddressDivishionName && { currentAddressDivishionName }),
        ...(currentAddressDistrictsName && { currentAddressDistrictsName }),
        ...(currentAddressUpzilaName && { currentAddressUpzilaName }),
        ...(Justwritethenameofthevillage && { Justwritethenameofthevillage }),
        ...(Justwritethenameofthevillage2 && { Justwritethenameofthevillage2 }),
        ...(whereGrowUpLocationName && { whereGrowUpLocationName }),
      };

      console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage2.updateOne(filter, updateDoc);

      res.send(result);
    });

    // ?- page 03 Educational qualification biodata page

    app.get("/userBiodataEducationalQualification", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage3.find(query).toArray();

      res.send(resust);
    });

    app.post("/userBiodataEducationalQualification", async (req, res) => {
      const addressformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage3.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage3.insertOne(addressformation);
      res.send(result);
    });

    // edit and update
    app.put("/userBiodataEducationalQualification", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        YourMediumOfEducation,
        HighestEducationalQualification,
        WhatClassDidYouStudyUpto,
        departmentOfSsc,
        resultOfSsc,
        hSCAlimEquivalentHandler,
        YearOfSSCEquivalentPassinHsc,
        departmentOfSscInHsc,
        sscResultInHsc,
        YearOfHscPassInHsc,
        departmentOfHscInHsc,
        hscResultInHsc,
        YearOfsscPassInDiplomaProgress,
        departmentOfsscDiplomaProgress,
        sscResultDiplomaProgress,
        DidyouReadTheDiplomainanySubjectDProgress,
        NameofTheDducationalInstitutionDProgress,
        WhatYearAreyouStudyingNowDProgress,
        departmentOfsscInDeploma,
        sscResultInDeploma,
        departmentOfSscInGraduationOngoing,
        sscResultInGraduationOngoing,
        DidyouStudyThroughAnyMediumAfterSSC,
        departmentOfsscInGraduate,
        sscResultInGraduate,
        didyoustudthroughanmediumafterSSCInGraduate,
        departmentOfsscInPostGraduate,
        sscResultInPostGraduate,
        didyouStudythMediumafterSSCInPostGraduate,
        departmentOfsscInDoctorate,
        sscResultInDoctorate,
        didyoustudytafterSSCInDoctorate,
        OtherEducationalQualifications,
        resultOfInnIbatidaiyah,
        resultOfInnMutawassitah,
        resultOfSanabiaUliyaa,
        restultOofbenefit,
        restultOofTakmeel,
        taklimrestultOfTaakhassus,
        takhassusOfResultt,
        LestreligiousEducationalQualificationss,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(YourMediumOfEducation && {
          YourMediumOfEducation,
        }),
        ...(HighestEducationalQualification && {
          HighestEducationalQualification,
        }),
        ...(WhatClassDidYouStudyUpto && { WhatClassDidYouStudyUpto }),
        ...(departmentOfSsc && { departmentOfSsc }),
        ...(resultOfSsc && { resultOfSsc }),
        ...(hSCAlimEquivalentHandler && { hSCAlimEquivalentHandler }),
        ...(YearOfSSCEquivalentPassinHsc && { YearOfSSCEquivalentPassinHsc }),
        ...(departmentOfSscInHsc && { departmentOfSscInHsc }),
        ...(sscResultInHsc && { sscResultInHsc }),
        ...(YearOfHscPassInHsc && { YearOfHscPassInHsc }),
        ...(departmentOfHscInHsc && { departmentOfHscInHsc }),
        ...(hscResultInHsc && { hscResultInHsc }),
        ...(YearOfsscPassInDiplomaProgress && {
          YearOfsscPassInDiplomaProgress,
        }),
        ...(departmentOfsscDiplomaProgress && {
          departmentOfsscDiplomaProgress,
        }),
        ...(sscResultDiplomaProgress && { sscResultDiplomaProgress }),
        ...(DidyouReadTheDiplomainanySubjectDProgress && {
          DidyouReadTheDiplomainanySubjectDProgress,
        }),
        ...(NameofTheDducationalInstitutionDProgress && {
          NameofTheDducationalInstitutionDProgress,
        }),
        ...(WhatYearAreyouStudyingNowDProgress && {
          WhatYearAreyouStudyingNowDProgress,
        }),
        ...(departmentOfsscInDeploma && { departmentOfsscInDeploma }),
        ...(sscResultInDeploma && { sscResultInDeploma }),
        ...(departmentOfSscInGraduationOngoing && {
          departmentOfSscInGraduationOngoing,
        }),
        ...(sscResultInGraduationOngoing && { sscResultInGraduationOngoing }),
        ...(DidyouStudyThroughAnyMediumAfterSSC && {
          DidyouStudyThroughAnyMediumAfterSSC,
        }),
        ...(departmentOfsscInGraduate && { departmentOfsscInGraduate }),
        ...(sscResultInGraduate && { sscResultInGraduate }),
        ...(didyoustudthroughanmediumafterSSCInGraduate && {
          didyoustudthroughanmediumafterSSCInGraduate,
        }),
        ...(departmentOfsscInPostGraduate && { departmentOfsscInPostGraduate }),
        ...(sscResultInPostGraduate && { sscResultInPostGraduate }),
        ...(didyouStudythMediumafterSSCInPostGraduate && {
          didyouStudythMediumafterSSCInPostGraduate,
        }),
        ...(departmentOfsscInDoctorate && { departmentOfsscInDoctorate }),
        ...(sscResultInDoctorate && { sscResultInDoctorate }),
        ...(didyoustudytafterSSCInDoctorate && {
          didyoustudytafterSSCInDoctorate,
        }),
        ...(OtherEducationalQualifications && {
          OtherEducationalQualifications,
        }),
        ...(resultOfInnIbatidaiyah && { resultOfInnIbatidaiyah }),
        ...(resultOfInnMutawassitah && { resultOfInnMutawassitah }),
        ...(resultOfSanabiaUliyaa && { resultOfSanabiaUliyaa }),
        ...(restultOofbenefit && { restultOofbenefit }),
        ...(restultOofTakmeel && { restultOofTakmeel }),
        ...(taklimrestultOfTaakhassus && { taklimrestultOfTaakhassus }),
        ...(takhassusOfResultt && { takhassusOfResultt }),
        ...(LestreligiousEducationalQualificationss && {
          LestreligiousEducationalQualificationss,
        }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage3.updateOne(filter, updateDoc);

      res.send(result);
    });

    // ?- page 04 Family information biodata page

    app.get("/userBiodataFamilyInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage4.find(query).toArray();

      res.send(resust);
    });

    app.post("/userBiodataFamilyInformation", async (req, res) => {
      const addressformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage4.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage4.insertOne(addressformation);
      res.send(result);
    });

    // edit and update
    app.put("/userBiodataFamilyInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        ForAuthoritiesOnlyFatherName,
        GroomOrBrideName,
        FatherOccupationDetails,
        FatherAlive,
        MatherName,
        MatherAlive,
        MotherOccupationDetails,
        BrothersCount,
        BrothersInformation,
        SisterCount,
        SistersInformation,
        OccupationOfUnclesAndAunts,
        FamilyEconomicstatus,
        DescriptionofEconomicConditionsInfamily,
        HowFamilyReligiousEnvironment,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(ForAuthoritiesOnlyFatherName && {
          ForAuthoritiesOnlyFatherName,
        }),
        ...(GroomOrBrideName && {
          GroomOrBrideName,
        }),
        ...(FatherOccupationDetails && {
          FatherOccupationDetails,
        }),
        ...(FatherAlive && {
          FatherAlive,
        }),
        ...(FamilyEconomicstatus && {
          FamilyEconomicstatus,
        }),
        ...(MatherAlive && {
          MatherAlive,
        }),
        ...(SisterCount && {
          SisterCount,
        }),
        ...(BrothersCount && {
          BrothersCount,
        }),
        ...(MatherName && { MatherName }),
        ...(MotherOccupationDetails && { MotherOccupationDetails }),
        ...(BrothersInformation && { BrothersInformation }),
        ...(SistersInformation && { SistersInformation }),
        ...(OccupationOfUnclesAndAunts && { OccupationOfUnclesAndAunts }),
        ...(DescriptionofEconomicConditionsInfamily && {
          DescriptionofEconomicConditionsInfamily,
          ...(HowFamilyReligiousEnvironment && {
            HowFamilyReligiousEnvironment,
          }),
        }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage4.updateOne(filter, updateDoc);

      res.send(result);
    });
    // ?- page 05 Personal information biodata page

    app.get("/userPersonalInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage5.find(query).toArray();

      res.send(resust);
    });

    app.post("/userPersonalInformation", async (req, res) => {
      const addressformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage5.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage5.insertOne(addressformation);
      res.send(result);
    });

    // edit and update
    app.put("/userPersonalInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        AreyouInvolvedInAnySpecialReligion,
        CanReciteTheQuranCorrectly,
        DoMahramNonMahramFollow,
        DoYouHaveAnyMentalorPhysicalillness,
        DoYouPrayFiveTimesADay,
        DoyouWatchDramasMoviesSerialsSongs,
        HowManyTimesAWeekIsYourDailyPrayer,
        MobileNumber,
        NamesOfAtLeast3Scholars,
        WearClothesAboveTheAnkle,
        WhatAreyourIdeasorBeliefsAboutShrines,
        WhatKindOfClothesDoYouUsuallywearOutsideTheHouse,
        WriteSomethingAboutYourself,
        circumcisedBeard,
        eyeColor,
        favoriteColor,
        favoriteFood,
        otherwiseLeave,
        mansPhoto,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(AreyouInvolvedInAnySpecialReligion && {
          AreyouInvolvedInAnySpecialReligion,
        }),
        ...(CanReciteTheQuranCorrectly && {
          CanReciteTheQuranCorrectly,
        }),
        ...(DoMahramNonMahramFollow && { DoMahramNonMahramFollow }),
        ...(DoYouHaveAnyMentalorPhysicalillness && {
          DoYouHaveAnyMentalorPhysicalillness,
        }),
        ...(DoYouPrayFiveTimesADay && { DoYouPrayFiveTimesADay }),
        ...(DoyouWatchDramasMoviesSerialsSongs && {
          DoyouWatchDramasMoviesSerialsSongs,
        }),
        ...(HowManyTimesAWeekIsYourDailyPrayer && {
          HowManyTimesAWeekIsYourDailyPrayer,
        }),
        ...(MobileNumber && {
          MobileNumber,
          ...(NamesOfAtLeast3Scholars && {
            NamesOfAtLeast3Scholars,
            ...(WearClothesAboveTheAnkle && { WearClothesAboveTheAnkle }),
            ...(WhatAreyourIdeasorBeliefsAboutShrines && {
              WhatAreyourIdeasorBeliefsAboutShrines,
            }),
            ...(WhatKindOfClothesDoYouUsuallywearOutsideTheHouse && {
              WhatKindOfClothesDoYouUsuallywearOutsideTheHouse,
            }),
            ...(WriteSomethingAboutYourself && { WriteSomethingAboutYourself }),
            ...(circumcisedBeard && { circumcisedBeard }),
            ...(eyeColor && { eyeColor }),
            ...(favoriteColor && { favoriteColor }),
            ...(favoriteFood && { favoriteFood }),
            ...(otherwiseLeave && { otherwiseLeave }),
            ...(mansPhoto && { mansPhoto }),
          }),
        }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage5.updateOne(filter, updateDoc);

      res.send(result);
    });

    // ?- page 06 Professional information biodata page
    app.get("/userprofessionalInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage6.find(query).toArray();

      res.send(resust);
    });

    app.post("/userprofessionalInformation", async (req, res) => {
      const professionalInformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage6.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage6.insertOne(
        professionalInformation
      );
      res.send(result);
    });

    // edit and update
    app.put("/userprofessionalInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const { ownOccupation, JobDetails, MonthlyIncome } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(ownOccupation && {
          ownOccupation,
        }),
        ...(JobDetails && {
          JobDetails,
        }),
        ...(MonthlyIncome && { MonthlyIncome }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage6.updateOne(filter, updateDoc);

      res.send(result);
    });

    // ?- page 07 Marriage information biodata page

    app.get("/userMarriageInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage7.find(query).toArray();

      res.send(resust);
    });

    app.post("/userMarriageInformation", async (req, res) => {
      const professionalInformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage7.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage7.insertOne(
        professionalInformation
      );
      res.send(result);
    });

    // edit and update
    app.put("/userMarriageInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        parentAgreeYourMarriage,
        CanYouKeepYourWifeOnTheScreenAfterMarriage,
        WantToLethisWifestudyAfterMarriage,
        WantToLetYourWifeWorkAfterMarriage,
        whereWillYouTakeYourWife,
        giftsJoytok,
        WhyAreYouGettingMarried,

        AreYouWillingToWorkAfterMarriageSis,
        ContinueStudyingAfterMarriageSister,
        ContinueJObAfterMarriageSister,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(parentAgreeYourMarriage && { parentAgreeYourMarriage }),
        ...(CanYouKeepYourWifeOnTheScreenAfterMarriage && {
          CanYouKeepYourWifeOnTheScreenAfterMarriage,
        }),
        ...(WantToLethisWifestudyAfterMarriage && {
          WantToLethisWifestudyAfterMarriage,
        }),
        ...(WantToLetYourWifeWorkAfterMarriage && {
          WantToLetYourWifeWorkAfterMarriage,
        }),
        ...(whereWillYouTakeYourWife && { whereWillYouTakeYourWife }),
        ...(giftsJoytok && { giftsJoytok }),
        ...(WhyAreYouGettingMarried && { WhyAreYouGettingMarried }),

        ...(AreYouWillingToWorkAfterMarriageSis && {
          AreYouWillingToWorkAfterMarriageSis,
        }),
        ...(ContinueStudyingAfterMarriageSister && {
          ContinueStudyingAfterMarriageSister,
        }),
        ...(ContinueJObAfterMarriageSister && {
          ContinueJObAfterMarriageSister,
        }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage7.updateOne(filter, updateDoc);

      res.send(result);
    });

    // ?- page 08 Expected partner info biodata page
    app.get("/userExpectedPartnerInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage8.find(query).toArray();

      res.send(resust);
    });

    app.post("/userExpectedPartnerInformation", async (req, res) => {
      const professionalInformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage8.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage8.insertOne(
        professionalInformation
      );
      res.send(result);
    });

    // edit and update
    app.put("/userExpectedPartnerInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        age,
        complexion,
        height,
        EducationalQualification,
        District,
        maritalStatus,
        Occupation,

        EconomicStatus,
        LifePartnerQualitiesExpected,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(age && { age }),
        ...(complexion && {
          complexion,
        }),
        ...(height && {
          height,
        }),
        ...(EducationalQualification && {
          EducationalQualification,
        }),
        ...(District && { District }),
        ...(maritalStatus && { maritalStatus }),
        ...(Occupation && { Occupation }),

        ...(EconomicStatus && {
          EconomicStatus,
        }),
        ...(LifePartnerQualitiesExpected && {
          LifePartnerQualitiesExpected,
        }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage8.updateOne(filter, updateDoc);

      res.send(result);
    });

    // ?- page 09 commitment info biodata page

    app.get("/usercommitmentInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage9.find(query).toArray();

      res.send(resust);
    });

    app.post("/usercommitmentInformation", async (req, res) => {
      const commitmentInformation = req.body;

      const existingUserBiodata = await biodataAllInfoPage9.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage9.insertOne(commitmentInformation);
      res.send(result);
    });

    // edit and update
    app.put("/usercommitmentInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        ubmittingYourBiodata1,
        testifybyAllahthattheInfo2,
        providingAnyfalseinforLeg3,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(ubmittingYourBiodata1 && { ubmittingYourBiodata1 }),
        ...(testifybyAllahthattheInfo2 && {
          testifybyAllahthattheInfo2,
        }),
        ...(providingAnyfalseinforLeg3 && {
          providingAnyfalseinforLeg3,
        }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage9.updateOne(filter, updateDoc);

      res.send(result);
    });

    // ?- page 10 communication info biodata page

    app.get("/userCommunicationInformation", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await biodataAllInfoPage10.find(query).toArray();

      res.send(resust);
    });

    app.post("/userCommunicationInformation", async (req, res) => {
      const communication = req.body;

      const existingUserBiodata = await biodataAllInfoPage10.findOne({
        infodataUsarEmail: req.query.email,
      });
      if (existingUserBiodata) {
        return res.send({
          message: `${req.query.email} is already Address information added`,
        });
      }

      const result = await biodataAllInfoPage10.insertOne(communication);
      res.send(result);
    });

    // edit and update
    app.put("/userCommunicationInformation", async (req, res) => {
      // console.log(req.body);
      if (!req.body || !req.query.email) {
        return res.send({
          message: `Missing request data`,
        });
      }

      const {
        Name,
        ParentMobileNumber,
        RelationshiParent,
        BiodataReceiptemail,
      } = req.body;

      // Create the update object only with non-empty fields
      const updateFields = {
        ...(Name && { Name }),
        ...(ParentMobileNumber && {
          ParentMobileNumber,
        }),
        ...(RelationshiParent && {
          RelationshiParent,
        }),
        ...(BiodataReceiptemail && {
          BiodataReceiptemail,
        }),
      };

      // console.log(updateFields);
      const filter = { infodataUsarEmail: req.query.email };

      const updateDoc = {
        $set: updateFields,
      };

      const result = await biodataAllInfoPage10.updateOne(filter, updateDoc);

      res.send(result);
    });

    //? --------------

    // all-buodata-submit
    // TODO: this function should be called after the user has submitted their  request
    // submitAllBiodata

    app.get("/submitAllBiodata/get", async (req, res) => {
      let query = {};
      console.log(req.query.email);
      if (req.query?.email) {
        query = { infodataUsarEmail: req.query.email };
      }
      const resust = await allBidataSubmitdb.find(query).toArray(); //TODO: this function should be called after the user has submitted their requestDelete viewCount

      res.send(resust);
    });

    app.post("/submitAllBiodata", async (req, res) => {
      const allBidataSubmit = req.body;
      delete allBidataSubmit._id;
      // const existingUserBiodata = await allBidataSubmitdb.findOne({
      //   infodataUsarEmail: req.query.email,
      // });
      // if (existingUserBiodata) {
      //   return res.send({
      //     message: `${req.query.email} is already Address information added`,
      //   });
      // }
      const result = await allBidataSubmitdb.insertOne(allBidataSubmit);
      res.send(result);
    });

    // all-aproved-biodata
    app.get("/all-aprovedbiodata/get", async (req, res) => {
      const query = { ApprovalRole: "Approved" };
      const resust = await allBidataSubmitdb.find(query).toArray();
      res.send(resust);
    });

    // search;

    // search bio no:

    app.get("/bio/data/search/on/bio/no", async (req, res) => {
      const bioNValue = req.query.BioN;
      // console.log(bioNValue);
      const query = { sequence: bioNValue };
      const resust = await allBidataSubmitdb.find(query).toArray();
      res.send(resust);
    });

    app.get("/bio/data/search", async (req, res) => {
      try {
        const {
          TypeofBiodata,
          MaritalStatus,
          permanentAddressDivishionName,
          permanentAddressDistrictNameName,
          permanentAddressUPZilaName,
        } = req.query;
        console.log("Query Parameters:", req.query);

        //? emtype specific " " " " " " " " " " " " " " " " " " " " String SEARCH
        if (
          (!TypeofBiodata ||
            TypeofBiodata === " সকল" ||
            TypeofBiodata === "All") &&
          (!MaritalStatus || MaritalStatus === " সকল") &&
          (!permanentAddressDivishionName ||
            permanentAddressDivishionName === "") &&
          (!permanentAddressDistrictNameName ||
            permanentAddressDistrictNameName === "") &&
          (!permanentAddressUPZilaName || permanentAddressUPZilaName === "")
        ) {
          // Check if there are no query parameters provided or specific conditions
          // All conditions are optional
          const query1 = { ApprovalRole: "Approved" };
          const results = await allBidataSubmitdb
            .find(query1)
            .sort({ sequence: 1 })
            .toArray();
          return res.send(results);
        }
        // -------------
        //? search for division and district addresses and uopzila addresses1
        if (
          (TypeofBiodata === " সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === " সকল" || MaritalStatus === "All")
        ) {
          const andConditions = [];
          if (permanentAddressDivishionName) {
            andConditions.push({
              $or: [
                {
                  permanentAddressDivishionName: permanentAddressDivishionName,
                },
              ],
            });
          }

          if (permanentAddressDistrictNameName) {
            andConditions.push({
              $or: [
                {
                  permanentAddressDistrictNameName:
                    permanentAddressDistrictNameName,
                },
              ],
            });
          }

          if (permanentAddressUPZilaName) {
            andConditions.push({
              $or: [{ permanentAddressUPZilaName: permanentAddressUPZilaName }],
            });
          }

          if (andConditions.length > 0) {
            const queryS1 = {
              ApprovalRole: "Approved",
              $and: andConditions,
            };

            const resultsS1 = await allBidataSubmitdb.find(queryS1).toArray();
            return res.send(resultsS1); // Sending the response inside the if block
          }
        }

        if (
          (TypeofBiodata &&
            MaritalStatus &&
            permanentAddressDistrictNameName) ||
          permanentAddressDivishionName ||
          permanentAddressUPZilaName
        ) {
          //? search for division and district addresses and uopzila addresses2
          const andConditions = [];

          if (TypeofBiodata) {
            andConditions.push({ $or: [{ TypeofBiodata: TypeofBiodata }] });
          }

          if (MaritalStatus) {
            andConditions.push({ $or: [{ MaritalStatus: MaritalStatus }] });
          }

          if (permanentAddressDivishionName) {
            andConditions.push({
              $or: [
                {
                  permanentAddressDivishionName: permanentAddressDivishionName,
                },
              ],
            });
          }

          if (permanentAddressDistrictNameName) {
            andConditions.push({
              $or: [
                {
                  permanentAddressDistrictNameName:
                    permanentAddressDistrictNameName,
                },
              ],
            });
          }

          if (permanentAddressUPZilaName) {
            andConditions.push({
              $or: [{ permanentAddressUPZilaName: permanentAddressUPZilaName }],
            });
          }

          if (andConditions.length > 0) {
            const queryS1 = {
              ApprovalRole: "Approved",
              $and: andConditions,
            };

            const resultsS1 = await allBidataSubmitdb.find(queryS1).toArray();
            return res.send(resultsS1); // Sending the response inside the if block
          }
        }

        // --------------
        // Check other conditions  "পাত্রের বায়োডাটা" সকল
        if (
          (TypeofBiodata === "পাত্রের বায়োডাটা" ||
            TypeofBiodata === "Male's Biodata") &&
          (MaritalStatus === " সকল" || MaritalStatus === "All")
        ) {
          const queryS2 = {
            ApprovalRole: "Approved",
            $or: [
              { TypeofBiodata: "পাত্রের বায়োডাটা" },
              { TypeofBiodata: "Male's Biodata" },
            ],
          };

          const results = await allBidataSubmitdb.find(queryS2).toArray();
          return res.send(results); // Sending the response inside the if block
        }
        // Check other conditions  "পাত্রীর বায়োডাটা" সকল
        if (
          (TypeofBiodata === "পাত্রীর বায়োডাটা" ||
            TypeofBiodata === "Female's Biodata") &&
          (MaritalStatus === " সকল" || MaritalStatus === "All")
        ) {
          const querS3 = {
            ApprovalRole: "Approved",
            $or: [
              { TypeofBiodata: "পাত্রীর বায়োডাটা" },
              { TypeofBiodata: "Female's Biodata" },
            ],
          };
          const results = await allBidataSubmitdb.find(querS3).toArray();
          return res.send(results); // Sending the response inside the if block
        }
        //? Check other conditions "পাত্রের বায়োডাটা" অবিবাহিত
        if (
          (TypeofBiodata === " সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === " সকল" || MaritalStatus === "All")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
          };
          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        //?1Male's Biodata
        if (
          (TypeofBiodata === "সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === "অবিবাহিত" || MaritalStatus === "unmarried")
        ) {
          // Construct a query to fetch all records that meet the MaritalStatus condition
          const queryS4 = {
            ApprovalRole: "Approved",
            $or: [
              { MaritalStatus: "অবিবাহিত" },
              { MaritalStatus: "unmarried" },
            ],
          };

          const resultsS4 = await allBidataSubmitdb.find(queryS4).toArray();
          return res.send(resultsS4);
        }

        // Check other conditions "পাত্রের বায়োডাটা" অবিবাহিত
        if (
          (TypeofBiodata === " সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === "অবিবাহিত" || MaritalStatus === "unmarried")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { MaritalStatus: "অবিবাহিত" },
                  { MaritalStatus: "unmarried" },
                ],
              },
            ],
          };
          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        //1Male's Biodata
        if (
          (TypeofBiodata === "পাত্রের বায়োডাটা" ||
            TypeofBiodata === "Male's Biodata") &&
          (MaritalStatus === "অবিবাহিত" || MaritalStatus === "married")
        ) {
          const queryS6 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রের বায়োডাটা" },
                  { TypeofBiodata: "Male's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "অবিবাহিত" },
                  { MaritalStatus: "unmarried" },
                ],
              },
            ],
          };

          const resultsS6 = await allBidataSubmitdb.find(queryS6).toArray();
          return res.send(resultsS6); // Sending the response inside the if block
        }

        // Check other conditions "পাত্রীর বায়োডাটা" অবিবাহিত
        //2 Female's Biodata
        if (
          (TypeofBiodata === "পাত্রীর বায়োডাটা" ||
            TypeofBiodata === "Female's Biodata") &&
          (MaritalStatus === "অবিবাহিত" || MaritalStatus === "unmarried")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রীর বায়োডাটা" },
                  { TypeofBiodata: "Female's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "অবিবাহিত" },
                  { MaritalStatus: "unmarried" },
                ],
              },
            ],
          };

          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        // --------------------
        //? ----------------
        // Check other conditions "পাত্রের বায়োডাটা" বিবাহিত
        if (
          (TypeofBiodata === " সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === "বিবাহিত" || MaritalStatus === "married")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { MaritalStatus: "বিবাহিত" },
                  { MaritalStatus: "married" },
                ],
              },
            ],
          };
          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        //1Male's Biodata
        if (
          (TypeofBiodata === "পাত্রের বায়োডাটা" ||
            TypeofBiodata === "Male's Biodata") &&
          (MaritalStatus === "বিবাহিত" || MaritalStatus === "married")
        ) {
          const queryS6 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রের বায়োডাটা" },
                  { TypeofBiodata: "Male's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "বিবাহিত" },
                  { MaritalStatus: "married" },
                ],
              },
            ],
          };

          const resultsS6 = await allBidataSubmitdb.find(queryS6).toArray();
          return res.send(resultsS6); // Sending the response inside the if block
        }

        // Check other conditions "পাত্রীর বায়োডাটা" বিবাহিত
        //2 Female's Biodata
        if (
          (TypeofBiodata === "পাত্রীর বায়োডাটা" ||
            TypeofBiodata === "Female's Biodata") &&
          (MaritalStatus === "বিবাহিত" || MaritalStatus === "married")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রীর বায়োডাটা" },
                  { TypeofBiodata: "Female's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "বিবাহিত" },
                  { MaritalStatus: "married" },
                ],
              },
            ],
          };

          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        // Check other conditions "পাত্রের বায়োডাটা" ডিভোর্সড
        if (
          (TypeofBiodata === " সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === "ডিভোর্সড" || MaritalStatus === "divorced")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { MaritalStatus: "ডিভোর্সড" },
                  { MaritalStatus: "divorced" },
                ],
              },
            ],
          };
          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        //1Male's Biodata
        if (
          (TypeofBiodata === "পাত্রের বায়োডাটা" ||
            TypeofBiodata === "Male's Biodata") &&
          (MaritalStatus === "ডিভোর্সড" || MaritalStatus === "divorced")
        ) {
          const queryS6 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রের বায়োডাটা" },
                  { TypeofBiodata: "Male's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "ডিভোর্সড" },
                  { MaritalStatus: "divorced" },
                ],
              },
            ],
          };

          const resultsS6 = await allBidataSubmitdb.find(queryS6).toArray();
          return res.send(resultsS6); // Sending the response inside the if block
        }

        // Check other conditions "পাত্রীর বায়োডাটা" ডিভোর্সড
        //2 Female's Biodata
        if (
          (TypeofBiodata === "পাত্রীর বায়োডাটা" ||
            TypeofBiodata === "Female's Biodata") &&
          (MaritalStatus === "ডিভোর্সড" || MaritalStatus === "divorced")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রীর বায়োডাটা" },
                  { TypeofBiodata: "Female's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "ডিভোর্সড" },
                  { MaritalStatus: "divorced" },
                ],
              },
            ],
          };

          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        // Check other conditions "পাত্রের বায়োডাটা" বিধবা
        if (
          (TypeofBiodata === " সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === "বিধবা" || MaritalStatus === "widow")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [{ MaritalStatus: "বিধবা" }, { MaritalStatus: "widow" }],
              },
            ],
          };
          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block-
        }
        //1Male's Biodata
        if (
          (TypeofBiodata === "পাত্রের বায়োডাটা" ||
            TypeofBiodata === "Male's Biodata") &&
          (MaritalStatus === "বিধবা" || MaritalStatus === "widow")
        ) {
          const queryS6 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রের বায়োডাটা" },
                  { TypeofBiodata: "Male's Biodata" },
                ],
              },
              {
                $or: [{ MaritalStatus: "বিধবা" }, { MaritalStatus: "widow" }],
              },
            ],
          };

          const resultsS6 = await allBidataSubmitdb.find(queryS6).toArray();
          return res.send(resultsS6); // Sending the response inside the if block
        }

        // Check other conditions "পাত্রীর বায়োডাটা" বিধবা
        //2 Female's Biodata
        if (
          (TypeofBiodata === "পাত্রীর বায়োডাটা" ||
            TypeofBiodata === "Female's Biodata") &&
          (MaritalStatus === "বিধবা" || MaritalStatus === "widow")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রীর বায়োডাটা" },
                  { TypeofBiodata: "Female's Biodata" },
                ],
              },
              {
                $or: [{ MaritalStatus: "বিধবা" }, { MaritalStatus: "widow" }],
              },
            ],
          };

          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        // Check other conditions "পাত্রের বায়োডাটা" বিপত্নীক
        if (
          (TypeofBiodata === " সকল" || TypeofBiodata === "All") &&
          (MaritalStatus === "বিপত্নীক" || MaritalStatus === "widower")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { MaritalStatus: "বিপত্নীক" },
                  { MaritalStatus: "widower" },
                ],
              },
            ],
          };
          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        //1Male's Biodata
        if (
          (TypeofBiodata === "পাত্রের বায়োডাটা" ||
            TypeofBiodata === "Male's Biodata") &&
          (MaritalStatus === "বিপত্নীক" || MaritalStatus === "widower")
        ) {
          const queryS6 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রের বায়োডাটা" },
                  { TypeofBiodata: "Male's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "বিপত্নীক" },
                  { MaritalStatus: "widower" },
                ],
              },
            ],
          };

          const resultsS6 = await allBidataSubmitdb.find(queryS6).toArray();
          return res.send(resultsS6); // Sending the response inside the if block
        }

        // Check other conditions "পাত্রীর বায়োডাটা" বিধবা
        //2 Female's Biodata
        if (
          (TypeofBiodata === "পাত্রীর বায়োডাটা" ||
            TypeofBiodata === "Female's Biodata") &&
          (MaritalStatus === "বিপত্নীক" || MaritalStatus === "widower")
        ) {
          const queryS5 = {
            ApprovalRole: "Approved",
            $and: [
              // Use $and here to combine multiple conditions
              {
                $or: [
                  { TypeofBiodata: "পাত্রীর বায়োডাটা" },
                  { TypeofBiodata: "Female's Biodata" },
                ],
              },
              {
                $or: [
                  { MaritalStatus: "বিপত্নীক" },
                  { MaritalStatus: "widower" },
                ],
              },
            ],
          };
          const resultsS5 = await allBidataSubmitdb.find(queryS5).toArray();
          return res.send(resultsS5); // Sending the response inside the if block
        }
        //? -----------------------

        // Handle other conditions
        // ...

        // No conditions matched, send an empty response or handle as needed
        res.send([]);
      } catch (error) {
        console.error("Error searching MongoDB:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //? all users are allowed chaking submission biodata gets submitted
    app.get("/all-users/dbio/data/submission-chaking", async (req, res) => {
      const result = await allBidataSubmitdb.find().toArray();
      res.send(result);
    });

    //? /details/bio/data
    // TODO:    Maybe we should check the status of the server and handle
    app.get("/details/bio/data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allBidataSubmitdb.findOne(query);
      // const result = await cursor.toArray(query)
      res.send(result);
    });

    // id-my-get for linlget
    app.get("/my/bio/data", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {
          infodataUsarEmail: req.query.email,
          ApprovalRole: "Approved",
        };
      }
      const result = await allBidataSubmitdb.findOne(query, { _id: 1 }); // Only fetch the _id field
      if (result) {
        res.send({ id: result._id });
      } else {
        res.status(404).send("User not found");
      }
    });

    // ------------

    // API endpoint to delete biodata by ID
    app.delete("/biodata/removal/:id", async (req, res) => {
      const biodataId = req.params.id;
      // console.log(biodataId);

      try {
        const result = await allBidataSubmitdb.deleteOne({
          _id: new ObjectId(biodataId),
        });
        res.send(result);
      } catch (error) {
        console.error("Error deleting biodata:", error);
        res.status(500).send("An error occurred while deleting biodata.");
      }
    });
    // shortLitst bio data user

    // short list data get

    const ObjectId = require("bson").ObjectId; // Import ObjectId from the bson library

    app.get("/deeni/biYa/userShORtliSt/like", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { userEmail: req.query.email };
      }

      const result = await userShortList.find(query).toArray();

      // Extract ObjectId strings and convert them to ObjectId instances
      const objectIdArray = result.map((item) => {
        return new ObjectId(item.id);
      });

      const filteredResult = { _id: { $in: objectIdArray } }; // Use _id field for ObjectId
      console.log(filteredResult);
      const fnnlResult = await allBidataSubmitdb.find(filteredResult).toArray();

      res.send(fnnlResult);
    });

    // add
    app.post("/deeni/biya/UserShortList", async (req, res) => {
      const shortList = req.body;

      const existingUserBiodata = await userShortList.findOne({
        userEmail: req.query.email,
      });
      if (existingUserBiodata) {
        const existingUserID = await userShortList.findOne({
          id: shortList.id,
        });
        if (existingUserID) {
          return res.send({
            message: `${req.query.email} is already  added`,
          });
        }
      }
      const result = await userShortList.insertOne(shortList);
      res.send(result);
    });

    // deeni / biya / userIgnore listening

    app.get("/deeni/biYa/userIgnore/disLike", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { userEmail: req.query.email };
      }

      const result = await userIgnorList.find(query).toArray();

      // Extract ObjectId strings and convert them to ObjectId instances
      const objectIdArray = result.map((item) => {
        return new ObjectId(item.id);
      });

      const filteredResult = { _id: { $in: objectIdArray } }; // Use _id field for ObjectId
      console.log(filteredResult);
      const fnnlResult = await allBidataSubmitdb.find(filteredResult).toArray();

      res.send(fnnlResult);
    });
    // ----

    app.post("/deeni/biya/userIgnore", async (req, res) => {
      const ignorList = req.body;

      const existingUserBiodata = await userIgnorList.findOne({
        userEmail: req.query.email,
      });
      if (existingUserBiodata) {
        const existingUserID = await userIgnorList.findOne({
          id: ignorList.id,
        });
        if (existingUserID) {
          return res.send({
            message: `${req.query.email} is already  added`,
          });
        }
      }
      const result = await userIgnorList.insertOne(ignorList);
      res.send(result);
    });

    // --

    // ?user biodata view save in database- by -canations
    //  যোগাযোগের তথ্য - ContactInformation.ContactInfoBio

    app.get("/deeni/biYa/User/ContactInformatioN/get", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { byBioUserEmail: req.query.email };
      }
      const result = await contactInformationDB.find(query).toArray();
      res.send(result);
    });

    app.post("/deeni/biya/Contact/informationDB", async (req, res) => {
      const contactinformation = req.body;
      console.log(contactinformation);
      const existingUserBiodata = await contactInformationDB.findOne({
        BioDataUser: req.query.email,
      });
      if (existingUserBiodata) {
        const existingUserID = await contactInformationDB.findOne({
          bioDataID: contactinformation.bioDataID,
        });
        if (existingUserID) {
          return res.send({
            message: `${req.query.email} is already  added`,
          });
        }
      }
      const result = await contactInformationDB.insertOne(contactinformation);
      res.send(result);
    });

    //? ---- report biodata by buy conation ----
    // admin
    app.get("/deeni/biya/conationBuyReport/admin/get", async (req, res) => {
      const result = await report.find().toArray();
      res.send(result);
    });
    // user
    app.get("/deeni/biya/conationBuyReport/user/get", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { userBuyEmail: req.query.email };
      }
      const result = await report.find(query).toArray();
      res.send(result);
    });

    // Report
    app.post("/deeni/biya/conationBuyReport/user", async (req, res) => {
      const conationBuyReport = req.body;
      // console.log(conationBuyReport);
      const result = await report.insertOne(conationBuyReport);
      res.send(result);
    });

    // notificationPost
    app.get("/deeni/biya/notificationPget", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await notificationPostDB.find(query).toArray();
      res.send(result);
    });

    app.post("/notificationPost", async (req, res) => {
      const notificationPost = req.body;
      // console.log(notificationPost);
      const result = await notificationPostDB.insertOne(notificationPost);
      res.send(result);
    });

    app.delete("/remove-bio-notificationPost/:id", async (req, res) => {
      const id = req.params.id;

      const result = await notificationPostDB.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // ----

    app.patch("/deeni/biya/conationBuyReport/admin/:id", async (req, res) => {
      const itemId = req.params.id;
      // console.log(itemId);
      const text = req.body;
      // console.log(text);

      const filter = { _id: new ObjectId(itemId) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          Status: text?.setSstatus,
        },
      };
      const result = await report.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //setup ... view with user count
    app.patch("/api/update-view-count/:itemId", async (req, res) => {
      const itemId = req.params.itemId;

      try {
        // Find the item by its unique identifier in the "viewCounts" collection
        const result = await allBidataSubmitdb.findOneAndUpdate(
          { _id: new ObjectId(itemId) },
          { $inc: { viewCount: 1 } }
          // { upsert: true, returnOriginal: false }
        );

        if (!result) {
          // Handle the case where no document was found
          res.status(404).json({ error: "Document not found" });
          return;
        }

        // Return the updated view count
        res.json({ viewCount: result?.value?.viewCount });
      } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // -----------------

    // biodata->Short List
    app.patch("/api/update-shortList-count/:itemId", async (req, res) => {
      const itemId = req.params.itemId;

      try {
        // Find the item by its unique identifier in the "viewCounts" collection
        const result = await allBidataSubmitdb.findOneAndUpdate(
          { _id: new ObjectId(itemId) },
          { $inc: { ShortListCount: 1 } }
          // { upsert: true, returnOriginal: false }
        );

        if (!result) {
          // Handle the case where no document was found
          res.status(404).json({ error: "Document not found" });
          return;
        }

        // Return the updated view count
        res.json({ ShortListCount: result?.value?.ShortListCount });
      } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // ----- approval  section --------------------------------
    app.patch("/approval-bio/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { ApprovalRole } = req.body;

        // Find the document by ID
        const findResult = await allBidataSubmitdb.findOne({
          _id: new ObjectId(id),
        });

        // Check if the document with the provided ID exists
        if (!findResult) {
          return res.status(404).json({ message: "Document not found" });
        }

        if (findResult) {
          const biodataUidid = generateUniqueId({
            length: 4,
            useLetters: true,
            useNumbers: false,
          }).toUpperCase();
          // console.log(biodataUidid);
          const now = new Date();
          const date = require("date-and-time");

          const yTimedate = date.format(now, "YY");

          const nowTimeAndUniqaeiD = `KM${biodataUidid}${yTimedate}`;
          console.log(nowTimeAndUniqaeiD);
          const result = await allBidataSubmitdb.updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                ApprovalRole: ApprovalRole,
                sequence: nowTimeAndUniqaeiD, // Add a biodid field
              },
            }
          );
        }

        // Count the total users with the same ApprovalRole
        // const total_users = (
        //   await allBidataSubmitdb
        //     .find({
        //       ApprovalRole: ApprovalRole,
        //     })
        //     .toArray()
        // ).length;

        // Update the document with a new sequence value
        // const newSequence = `KM${total_users + 1}`;

        // Check if the new sequence already exists in the database
        // const findSequence = await allBidataSubmitdb.findOne({
        //   sequence: newSequence,
        // });

        // ----- uuid

        // const newSequence = `DB${total_users + 2}`;

        // if (findSequence) {
        //   // If the sequence already exists, increment it
        //   const newSequence = `DB${total_users + 2}`;
        //   await allBidataSubmitdb.updateOne(
        //     { _id: new ObjectId(id) },
        //     {
        //       $set: {
        //         ApprovalRole: ApprovalRole,
        //         sequence: newSequence, // Add a sequence field
        //       },
        //     }
        //   );
        // } else {
        //   // If the sequence doesn't exist, update with the original newSequence
        //   await allBidataSubmitdb.updateOne(
        //     { _id: new ObjectId(id) },
        //     {
        //       $set: {
        //         ApprovalRole: ApprovalRole,
        //         sequence: newSequence, // Add a sequence field
        //       },
        //     }
        //   );
        // }

        // res.json({
        //   message: "Document updated",
        //   updatedCount: 1, // Assuming only one document is updated
        // });
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // -- remove-bio

    app.delete("/remove-bio-delete/:id", async (req, res) => {
      const id = req.params.id;

      const result = await allBidataSubmitdb.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // ---- administration role

    app.get("/user/administration_role", async (req, res) => {
      const email = req.query.email;
      if (email) {
        const query = { role: { $in: ["admin", "modaretor"] }, email: email };
        // const query = { role: "admin", email: email };
        const resust = await usersDataInDniBya.findOne(query);
        res.send(resust);
      }
    });

    app.patch("/user/administration_role", async (req, res) => {
      const email = req.body.email;
      console.log(email);
      if (email) {
        const filter = { email: email };
        const options = { upsert: true };

        const updateDoc = {
          $set: {
            role: "modaretor", // Corrected the role name to "moderator"
          },
        };
        const result = await usersDataInDniBya.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
        console.log(result);
      }
    });
    app.patch("/user/Rmoveadministration_role", async (req, res) => {
      const email = req.body.email;
      console.log(email);
      if (email) {
        const filter = { email: email };
        const options = { upsert: true };

        const updateDoc = {
          $set: {
            role: "Removemodaretor", // Corrected the role name to "moderator"
          },
        };
        const result = await usersDataInDniBya.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
        console.log(result);
      }
    });

    //?  connection pakagemodified

    app.get("/purchase/package", async (req, res) => {
      const resust = await connection.find().sort({ priceEN: 1 }).toArray();
      res.send(resust);
    });

    app.get("/purchase-packageid/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await connection.findOne(query);
      res.send(result);
    });

    //? Bkash payment gateway

    // Middleware to obtain a bKash access token
    const middlewareBkash = async (req, res, next) => {
      try {
        const { data } = await axios.post(
          process.env.bkash_grant_token_url,
          {
            app_key: process.env.bkash_api_key,
            app_secret: process.env.bkash_secret_key,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              username: process.env.bkash_username,
              password: process.env.bkash_password,
            },
          }
        );

        app.locals.id_token = data.id_token;
        // globals.set("id_token", data.id_token, { protected: true });
        // console.log(data);
        next();
      } catch (error) {
        return res
          .status(401)
          .json({ error: "Error obtaining bKash access token" });
      }
    };

    bkash_headers = async () => {
      return {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: app.locals.id_token,
        "x-app-key": process.env.bkash_api_key,
      };
    };

    // Endpoint for initiating a bKash payment
    app.post("/initiate-payment", middlewareBkash, async (req, res) => {
      try {
        const { amount, payUserEmail, connectionCounts } = req.body;
        console.log("connectionCounts", connectionCounts);

        // Set global variables using app.locals
        app.locals.Pay_user_Email = payUserEmail;
        app.locals.connectionCount = connectionCounts;

        // globals.set("Pay_user_Email", payUserEmail);
        // globals.set("connectionCount", connectionCounts);
        const { data } = await axios.post(
          process.env.bkash_create_payment_url,
          {
            mode: "0011",
            payerReference: " ",

            callbackURL:
              "https://kobulserverbackend.kobul.com.bd/bkash/payment/callback",
            amount: amount,
            currency: "BDT",
            intent: "sale",
            merchantInvoiceNumber: "Inv" + uuidv4().substring(0, 6),
          },
          {
            headers: await this.bkash_headers(),
          }
        );
        // console.log(data);
        return res.status(200).json({ bkashURL: data.bkashURL });
      } catch (error) {
        return res.status(401).json({ error: error.message });
      }
    });

    app.get("/bkash/payment/callback", middlewareBkash, async (req, res) => {
      const { paymentID, status } = req.query;
      console.log(req.query);
      if (paymentID) {
        const id = { paymentID: paymentID };
        const result = await bkashBD.findOne(id);
        if (result) {
          return res.redirect(
            `https://kobul.com.bd/error?messages=try-payment`
          );
        }
      }

      if (status === "cancel" || status === "failure") {
        return res.redirect(`https://kobul.com.bd/error?messages=${status}`);
      }
      if (status === "success") {
        try {
          const { data } = await axios.post(
            process.env.bkash_execute_payment_url,
            { paymentID },
            {
              headers: await this.bkash_headers(),
            }
          );
          if (data && data.statusCode === "0000") {
            // save todo bkasj infomation in database mongodb api
            const payUserEmail = app.locals.Pay_user_Email;
            const connectionCounts = app.locals.connectionCount;

            // Now, payUserEmail and connectionCounts elsewhere in your application.

            const newConnectionCount = connectionCounts;
            console.log("console-2", newConnectionCount);
            const info = {
              PayUserEmail: payUserEmail,
              paymentID: data.paymentID,
              newConnectionCount,
              customerMsisdn: data.customerMsisdn,
              trxID: data.trxID,
              amount: data.amount,
              transactionStatus: data.transactionStatus,
              paymentExecuteTime: data.paymentExecuteTime,
              merchantInvoiceNumber: data.merchantInvoiceNumber,
            };
            // Insert the payment info into the database
            const paymentResult = await bkashBD.insertOne(info);

            if (paymentResult.error) {
              console.error(
                "Error inserting data into the database:",
                paymentResult.error
              );
              return res.status(500).json({ error: "Database error" });
            }
            // part 2
            // Retrieve connection counts and sum them up
            const findQuery = { PayUserEmail: payUserEmail };
            const connectionCountFinding = await bkAshPayConationCount.findOne(
              findQuery
            );
            if (connectionCountFinding) {
              const FirstConnectionCountConvert = parseInt(
                connectionCountFinding?.totalConnectionCount
              );
              console.log("console-1", FirstConnectionCountConvert);
              const filter = { PayUserEmail: payUserEmail };
              const options = { upsert: true };
              const updateDoc = {
                $set: {
                  totalConnectionCount:
                    FirstConnectionCountConvert + connectionCounts,
                },
              };
              console.log("console-0", updateDoc);
              const result = await bkAshPayConationCount.updateOne(
                filter,
                updateDoc,
                options
              );
            } else {
              // Calculate the new totalConnectionCount
              // Insert the totalConnectionCount into a new collection
              const countInfo = {
                totalConnectionCount: connectionCounts,
                PayUserEmail: payUserEmail,
              };
              const countResult = await bkAshPayConationCount.insertOne(
                countInfo
              );
            }
            return res.redirect(`https://kobul.com.bd/user-deshbordhome`);
          } else {
            return res.redirect(
              `https://kobul.com.bd/error?messages=${data.statusMessage}`
            );
          }
        } catch (error) {
          console.log(error);
          return res.redirect(
            `https://kobul.com.bd/error?messages=${error.message}`
          );
        }
      }
    });

    // --------------
    // refund bkashed
    app.get("/refundHundRed/:trxID", middlewareBkash, async (req, res) => {
      const { trxID } = req.params;
      console.log(trxID);
      // try {
      const payment = await bkashBD.findOne({ trxID });
      console.log(payment);
      const { data } = await axios.post(
        process.env.bkash_refund_transaction_url,
        {
          paymentID: payment?.paymentID,
          amount: payment?.amount,
          trxID,
          sku: "payment",
          reason: "cashback",
        },
        {
          headers: await this.bkash_headers(),
        }
      );

      console.log(data);
      console.log(data.statusCode);
      if (data && data.statusCode == "0000") {
        return res.status(200).json({ message: "refund success" });
      } else {
        return res.status(404).json({ error: "refund failed1" });
      }
      // } catch {}
    });
    // ------------------
    // ------------------
    // ------------------

    // OfAllPaYBkashInfo
    app.get("/pay/infoAllBkashUser", async (req, res) => {
      const result = await bkashBD.find().toArray();
      res.send(result);
    });

    // connection_GetAccount
    app.get("/connection/GetAccount/PayInfo", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { PayUserEmail: req.query.email };
      }
      const result = await bkashBD.find(query).toArray();
      res.send(result);
    });

    app.get("/connection/counts", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { PayUserEmail: req.query.email };
      }
      const result = await bkAshPayConationCount.findOne(query);
      res.send(result);
    });

    app.patch("/connection/mainesPoints", async (req, res) => {
      // Extract the email from the request query
      const payUserEmail = req.query?.email;

      if (!payUserEmail) {
        return res.status(400).json({ error: "Missing email query parameter" });
      }
      const { mainesPointStore } = req.body;
      // console.log(mainesPointStore);

      // Define the query based on the email
      const query = { PayUserEmail: payUserEmail };

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          totalConnectionCount: mainesPointStore,
        },
      };
      try {
        const result = await bkAshPayConationCount.updateOne(
          query,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // --main dashBoard all bConationCount

    app.get("/connection/counts/dashBoard/R", async (req, res) => {
      const result = await bkAshPayConationCount.find().toArray();
      res.send(result);
    });

    // totalSuccessfulMarriages

    app.patch("/deeni/biya/totalSuccessfulMarriages", async (req, res) => {
      const marry = req.body;
      console.log(marry);
      const filter = { filter: "filter" };
      const updateDoc = {
        $set: {
          totalSuccessfulMarriages: marry.totalSuccessfulMarriages,
        },
      };
      const result = await totalSuccessfulMarriages.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    app.get("/deeni/biya/totalSuccessfulMarriages", async (req, res) => {
      const result = await totalSuccessfulMarriages.findOne();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // popup
    app.patch("/popup/updated", async (req, res) => {
      const link = req.body;
      // console.log(link);
      const filter = { x: "x" };
      const updateDoc = {
        $set: {
          link: link.link,
          imgLink: link.imgLink,
        },
      };
      // Add your filter criteria to identify the document to update
      const result = await popup.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/popup/updated/active", async (req, res) => {
      const active = req.body.active;
      // console.log(active);
      const filter = { x: "x" };
      const updateDoc = {
        $set: {
          active: active,
        },
      };
      // Add your filter criteria to identify the document to update
      const result = await popup.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/popup/updated/deactive", async (req, res) => {
      const active = req.body.active;
      console.log(active);
      const filter = { x: "x" };
      const updateDoc = {
        $set: {
          active: active,
        },
      };
      // Add your filter criteria to identify the document to update
      const result = await popup.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/popup/data", async (req, res) => {
      const result = await popup.findOne();
      res.send(result);
    });
    // end
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the Kobul Matrimony server Test Browser!");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
