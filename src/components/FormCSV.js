import React, { useState } from "react";
import { useDispatch,useSelector  } from "react-redux";
import { addFormData, addExcelData } from "../redux/slice";
import readXlsxFile from "read-excel-file";
import "bootstrap/dist/css/bootstrap.min.css";

function Form() {
  const dispatch = useDispatch();
  const [isSubmitDisabled, setSubmitDisabled] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [focusedField, setFocusedField] = useState(null);

  const [typeError, setTypeError] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const registeredEmails = useSelector((state) => state.form.registeredEmails); 
  const registeredFirstNames = useSelector((state) => state.form.registeredFirstNames); 
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const addData = () => {
    try {
      if (formData) {
        dispatch(addFormData(formData));
        console.log("Form data dispatched");
      } else {
        console.log("Failed to dispatch form data");
      }

      if (excelData) {
        dispatch(addExcelData(excelData));
        console.log("Excel data dispatched");
      } else {
        console.log("Failed to dispatch Excel data");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleFile = async (e) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.target.files[0];

    if (selectedFile) {
      if (fileTypes.includes(selectedFile.type)) {
        setTypeError(null);

        if (selectedFile.type === "text/csv") {
          let reader = new FileReader();
          reader.readAsText(selectedFile);
          reader.onload = (e) => {
            const data = e.target.result;
            localStorage.setItem(
              "excelData",
              JSON.stringify(data.slice(0, 10))
            );
            console.log("Data from CSV", data);
            console.log("Successfully Data stored in Local Storage");

            const storedData = localStorage.getItem("excelData");
            const dataArray = storedData ? JSON.parse(storedData) : [];
            console.log("Data in Array Format", dataArray);
            setFormData(dataArray);
            dispatch(addExcelData(dataArray));
          };
        } else {
          let reader = new FileReader();
          reader.readAsArrayBuffer(selectedFile);

          reader.onload = async (e) => {
            setExcelData(e.target.result);

            const workbook = await readXlsxFile(e.target.result);
            const data = workbook;

            const headers = data[0];
            const dataArrayWithoutHeaders = data.slice(1);
            const jsonArray = dataArrayWithoutHeaders.map((row) => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] =
                  typeof header === "string" &&
                  header.toLowerCase().includes("date")
                    ? row[index].toLocaleString()
                    : row[index];
              });
              return obj;
            });

            console.log("Array of objects", jsonArray);

            localStorage.setItem(
              "Array of array into json format ",
              JSON.stringify(jsonArray)
            );
            console.log("Successfully JsonData stored in Local Storage");
            setExcelData(jsonArray);

            dispatch(addExcelData(jsonArray));
          };
        }
      } else {
        setTypeError("Please select only CSV or Excel file types");
        setExcelData(null);
      }
    } else {
      console.log("Please select your file");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
    setFocusedField(name); 
    validateForm();
    const isEmailAlreadyRegistered = registeredEmails.includes(formData.email);
    const isFirstNameAlreadyRegistered = registeredFirstNames.includes(formData.firstName);
    
    if (isEmailAlreadyRegistered) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Email is already registered",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "",
      }));
    }

    if (isFirstNameAlreadyRegistered) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        firstName: "First name is already registered",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        firstName: "",
      }));
    }
  };


  
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
  
    const nameRegex = /^[a-zA-Z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!formData.firstName.trim().match(nameRegex)) {
      newErrors.firstName = "First name is not valid";
      valid = false;
    } else {
      newErrors.firstName = "";
    }
  
    if (!formData.lastName.trim().match(nameRegex)) {
      newErrors.lastName = "Last name is not valid";
      valid = false;
    } else {
      newErrors.lastName = "";
    }
  
    if (!formData.email.trim().match(emailRegex)) {
      newErrors.email = "Email is not valid";
      valid = false;
    } else {
      newErrors.email = "";
    }
  
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else {
      newErrors.password = "";
    }
  
    Object.keys(newErrors).forEach((field) => {
      if (field !== focusedField) {
        newErrors[field] = "";
      }
    });
  
    if (!excelData) {
      setTypeError("Please select a CSV or Excel file");
      valid = false;
    } else {
      setTypeError(null);
    }
  
    setErrors(newErrors);
  
    const isValidForm = Object.values(newErrors).every((error) => error === "");
  
    setSubmitDisabled(!isValidForm || !valid);
  
    return valid;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Call addData to dispatch both form and Excel data");

    await submitForm(formData, excelData);

    console.log("Connection successfull");

    if (validateForm()) {
      console.log("Form Data:", formData);
      console.log("Excel Data:", excelData);
      setShowSuccessPopup(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setExcelData(null);
      setSubmitDisabled(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } else {
      console.log("Form has errors. Please fix them.");
    }
  };

  const submitForm = async (formData, excelData) => {
    try {
      const formattedExcelData = excelData.map((individualExcelData) => {
        const formattedData = {};
        Object.keys(individualExcelData).forEach((key) => {
          formattedData[key] = key.toLowerCase().includes("date") &&
            key.toLowerCase().includes("jan 23")
            ? formatDate(new Date(individualExcelData[key]))
            : key.toLowerCase().includes("date")
            ? ""
            : individualExcelData[key];
            
        });

        
        return formattedData;
        
      });

      const requestBody = {
        emp: formData,
        excelData: formattedExcelData,
      };

      // console.log("Request Body:", JSON.stringify(requestBody));

      const response = await fetch("http://localhost:8080/api/employees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),

      });

      if (response.ok) {
        console.log("Form and Excel data submitted successfully");
        console.log(formData);
        console.log(formattedExcelData);

      } else {
        console.log("Server side excel data : ", formattedExcelData);
        console.error("Failed to submit form data");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  function formatDate(date) {
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }
  // function formatDateHeading(header) {
  //   const dateParts = header.match(/\b(\w{3} \d{2})\b/);
  //   return dateParts ? dateParts[0] : header;
  // }

  return (
    <div className="container mt-5">
  <div className="row justify-content-center">
    <div className="col-md-4 border p-4 mt-5 rounded shadow bg-white">
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">
          <label htmlFor="fname" className="form-label col-2   text-left mt-2 ">
            Fname
          </label>
          <div className="col-12">
            <input
              type="text"
              className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
              id="fname"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <div className={`invalid-feedback col-6 text-right mt-2  ${errors.firstName ? "d-block" : "d-none"}`} style={{paddingLeft:'220px'}} >
              {errors.firstName}
            </div>
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="lname" className="form-label col-2 text-left mt-2">
            Lname
          </label>
          <div className="col-12">
            <input
              type="text"
              className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
              id="lname"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <div className="invalid-feedback col-6 text-right mt-2" style={{paddingLeft:'220px'}}>{errors.lastName}</div>
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="email" className="form-label col-2 text-left mt-2">
            Email 
          </label>
          <div className="col-12">
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              id="email"
              name="email"
              placeholder="Enter the email"
              value={formData.email}
              onChange={handleChange}
            />
            <div className="invalid-feedback col-6 text-right mt-2"style={{paddingLeft:'240px'}}>{errors.email}</div>
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="pass" className="form-label col-3 text-left mt-2">
            Password
          </label>
          <div className="col-12">
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              id="pass"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="invalid-feedback col-6 text-right mt-2" style={{paddingLeft:'110px'}}>{errors.password}</div>
          </div>
        </div>

        <div className="mb-3 row">
          <label htmlFor="fileInput" className="form-label col-2 text-left mt-2">
            File
          </label>
          <div className="col-12">
            <input
              id="fileInput"
              type="file"
              className={`form-control ${typeError ? "is-invalid" : ""}`}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              required
              onChange={handleFile}
            />
            <div className="invalid-feedback col-6 text-right mt-2 " style={{paddingLeft:'160px'}}>{typeError}</div>
          </div>
        </div>

        <button
          type="submit"
          onClick={addData}
          className="btn btn-primary"
          disabled={isSubmitDisabled}
        >
          Submit
        </button>
      </form>
    </div>
  </div>
  {showSuccessPopup && (
    <div className="row mt-3 justify-content-center align-items-center">
      <div className="col-md-4">
        <div className="alert alert-success text-center" role="alert">
          Successfully submitted! Redirecting...
        </div>
      </div>
    </div>
  )}



      {/* <div className="row mt-4">
        <div className="col-md-6">
          {excelData && Array.isArray(excelData) ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    {Object.keys(excelData[0]).map((key) => (
                      <th key={key}>{formatDateHeading(key)}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {excelData.map((individualExcelData, index) => (
                    <tr key={index}>
                      {Object.keys(individualExcelData).map((key) => (
                        <td key={key}>
                          {key.toLowerCase().includes("date") &&
                          key.toLowerCase().includes("jan 23")
                            ? formatDate(new Date(individualExcelData[key]))
                            : key.toLowerCase().includes("date")
                            ? ""
                            : individualExcelData[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No File is uploaded yet!</div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default Form;
