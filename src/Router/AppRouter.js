// AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Route,NavLink, Routes } from 'react-router-dom';
import './AppRouter.css'
import Form from "../components/FormCSV";
import List from "../components/List";
const AppRouter = () => {
  return (
      <Router>
          <nav className="nav-header">
            <NavLink to="/form" activeClassName="active">
              Form
            </NavLink>
            <NavLink to="/list" activeClassName="active">
              List
            </NavLink>
          </nav>

          <Routes>
          <Route path="/form" element={<Form />} />
            <Route path="/list" element={<List />} />
          </Routes>
      </Router>    
  );
};


export default AppRouter;
