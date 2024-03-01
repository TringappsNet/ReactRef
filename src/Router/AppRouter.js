import React from "react";
import { BrowserRouter as Router, Route, NavLink, Routes } from 'react-router-dom';
import './AppRouter.css';
import Form from "../components/FormCSV";
import List from "../components/List";

const AppRouter = () => {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="navbar-brand">WEBPORTAL</div>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <NavLink to="/form" className="nav-link" activeclassname="active">
                Form
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/list" className="nav-link" activeclassname="active">
                List
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/form" element={<Form />} />
        <Route path="/list" element={<List />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
