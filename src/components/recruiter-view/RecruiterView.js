import React, { useState, useEffect } from "react";

import ResumeView from "./ResumeView";
import { useTransition, animated } from "react-spring";
import "../../Static/RecruiterView.css";
import CandidatesList from "../../Static/Candidates.json";
import Spinner from "react-bootstrap/Spinner";
import RecruiterViewColumns from "./RecruiterViewColumns";
import { Col, Row, Container } from "react-bootstrap";
import { withFirebase } from "../Firebase";
import axios from "axios";

function RecruiterView({ Firebase, ...props }) {
  const [resumeView, setResumeView] = useState(true);
  const [recruiter, setRecruiter] = useState(null);
  const [candidate, setCandidate] = useState(CandidatesList.CandidatesList[0]);
  const [filters, setFilters] = useState(null);
  function toggleResumeView(info) {
    setResumeView(!resumeView);
    setCandidate(info);
  }

  async function getListArrays(collection, doc) {
    const data = await Firebase.db.collection(collection).doc(doc).get();
    return data.data();
  }
  async function collectData() {
    const gradHolder = await getListArrays("Graduation Year", "gradYears");
    const languageHolder = await getListArrays(
      "Programming Languages",
      "progLanguages"
    );
    const dbSystemHolder = await getListArrays(
      "Database Systems",
      "databaseSystems"
    );
    const opSystemHolder = await getListArrays(
      "Operating Systems",
      "operatingSystems"
    );
    const majorsHolder = await getListArrays("Majors", "majorsList");
    const frameworksHolder = await getListArrays(
      "Frameworks and Tools",
      "frameworksAndTools"
    );
    const schoolsHolder = await getListArrays("Schools", "SchoolsList");

    const eventHolder = await getListArrays("Events", "eventsList");

    setFilters({
      "Graduation Year": gradHolder.gradYearList,
      "Programming Languages": languageHolder.progLanguages,
      "Database Systems": dbSystemHolder.databaseSystems,
      "Operating Systems": opSystemHolder.operatingSystems,
      "Primary Major": majorsHolder.majorsList,
      "Secondary Major": majorsHolder.majorsList,
      Minors: majorsHolder.majorsList,
      "Frameworks and Tools": frameworksHolder.frameworksAndTools,
      School: schoolsHolder.schoolsList,
      Events: eventHolder.eventsList,
      "Active Filters": {
        "Programming Languages": [],
        "Frameworks and Tools": [],
        School: [],
        Events: [],
        "Primary Major": [],
        "Secondary Major": [],
        Minors: [],
        "Operating Systems": [],
        "Database Systems": [],
        "Graduation Year": [],
      },
    });
  }

  async function addFilter(filterName) {
    let filterArr = filters["Active Filters"];
    let specificFilter = "";

    if (filterName.name.includes(".")) {
      const index = filterName.name.indexOf(".");
      specificFilter = filterName.name.slice(0, index);
    } else {
      specificFilter = filterName.name;
    }

    filterArr[specificFilter].push(filterName);
    setFilters((prev) => ({
      ...prev,
      "Active Filters": filterArr,
    }));
    const preData = await axios.post(
      "http://localhost:5001/unc-cs-resume-database-af14e/us-central1/api/queryV3",
      { filtersForQuery: filterArr, empty: false }
    );
    const data = preData.data;
    setCards(data);
  }
  async function removeFilter(filterName) {
    let filterArr = filters["Active Filters"];

    let specificFilter = "";

    if (filterName.name.includes(".")) {
      const index = filterName.name.indexOf(".");
      specificFilter = filterName.name.slice(0, index);
    } else {
      specificFilter = filterName.name;
    }

    let indexForSplice = 0;
    for (let i = 0; i < filterArr[specificFilter].length; i++) {
      if (
        filterArr[specificFilter][i].name === filterName.name &&
        filterArr[specificFilter][i].value === filterName.value
      ) {
        indexForSplice = i;
        break;
      }
    }

    filterArr[specificFilter].splice(indexForSplice, 1);
    setFilters((prev) => ({
      ...prev,
      "Active Filters": filterArr,
    }));

    let isEmpty = true;

    Object.keys(filterArr).forEach((eachFilter) => {
      if (filterArr[eachFilter].length !== 0) {
        isEmpty = false;
      }
    });

    const preData = await axios.post(
      "http://localhost:5001/unc-cs-resume-database-af14e/us-central1/api/queryV3",
      { filtersForQuery: filterArr, empty: isEmpty }
    );

    const data = preData.data;
    setCards(data);
  }

  function isCurrentFilter(objToAdd) {
    let exitCondition = false;
    const filterArr = filters["Active Filters"];
    Object.keys(filterArr).forEach((keyName) => {
      filterArr[keyName].forEach((item) => {
        if (item.name === objToAdd.name && item.value === objToAdd.value) {
          exitCondition = true;
          return;
        }
      });
    });
    return exitCondition;

    // if (filters["Active Filters"] !== undefined) {
    //   Object.keys(filterArr).forEach((keyName) => {
    //     filterArr[keyName].forEach((item) => {
    //       if (item.name === objToAdd.name && item.value === objToAdd.value) {
    //         return true;
    //       }
    //     });
    //   });

    //   // let newArr = filters["Active Filters"].filter((item) => {
    //   //   // console.log(item.name === objToAdd.name);
    //   //   // console.log(item.value === objToAdd.value);
    //   //   return item.name === objToAdd.name && item.value === objToAdd.value;
    //   // });
    //   //console.log(newArr);
    //   return false;
    // } else {
    //   return false;
    // }
  }

  const [cards, setCards] = useState(null);
  async function updateRecruiter() {
    const data = await Firebase.getRecruiterInfo(Firebase.auth.currentUser.uid);
    setRecruiter(data);
  }

  useEffect(() => {
    async function fetchUsers() {
      const data = await Firebase.getAllStudents();
      const recruiter = await Firebase.getRecruiterInfo(
        Firebase.auth.currentUser.uid
      );
      setRecruiter(recruiter);
      setCards(data);
    }
    fetchUsers();
    collectData();
  }, []);

  const transitions = useTransition(resumeView, null, {
    from: { position: "absolute", opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  if (filters !== null && recruiter !== null) {
    return transitions.map(({ item, key, props }) =>
      item ? (
        <animated.div style={props}>
          <RecruiterViewColumns
            addFilter={(filterName) => addFilter(filterName)}
            isCurrentFilter={(objToAdd) => isCurrentFilter(objToAdd)}
            removeFilter={(filterName) => removeFilter(filterName)}
            filters={filters}
            updateRecruiter={() => updateRecruiter()}
            cards={cards}
            recruiterObj={recruiter}
            toggleResumeView={(candidate) => toggleResumeView(candidate)}
          />
        </animated.div>
      ) : (
        <animated.div style={props}>
          <Container
            fluid
            className="p-0 vw-100 recruiterViewContainer"
            style={{ backgroundColor: "#13294B" }}
          >
            <Row>
              <Col className="d-flex justify-content-center resumeViewContainer">
                <ResumeView
                  candidate={candidate}
                  toggleResumeView={(candidate) => toggleResumeView(candidate)}
                />
              </Col>
            </Row>
          </Container>
        </animated.div>
      )
    );
  } else {
    return (
      <div className="d-flex justify-content-center recruiterSpinnerDiv">
        <Spinner animation="border" role="status" className="recruiterSpinner">
          {" "}
          <span className="sr-only">Loading...</span>{" "}
        </Spinner>
      </div>
    );
  }
}
export default withFirebase(RecruiterView);
