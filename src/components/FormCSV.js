import React, { useState } from "react";
import './FormCSV.css';
// import axios from "axios";
// import * as XLSX from 'xlsx';
import { useDispatch } from "react-redux";
import { addFormData,addExcelData } from "../redux/slice";
import readXlsxFile from 'read-excel-file';



function Form() {
  const dispatch = useDispatch();
  // const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [retrievedData, setRetrievedData] = useState(null);


  const [excelData, setExcelData] = useState(null);


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


  function addData() {
    try{
    if (formData) {
      dispatch(addFormData(formData));
      console.log("Form data dispatched");
  
      // // Clear form data if needed
      // setFormData({
      //   firstName: "",
      //   lastName: "",
      //   email: "",
      //   password: "",
      // });
    } else {
      console.log("Failed to dispatch form data");
    }
    // console.log(excelData);

    if (excelData) {
      dispatch(addExcelData(excelData));
      console.log("Excel data dispatched");
      
  
      // setExcelData(null);
      // dispatch(addExcelData(excelData));

    } else {
      console.log("Failed to dispatch Excel data");
      // console.log(excelData);
    }
  }
  catch (error) {
    console.error("An error occurred:", error);
  }
}

const handleFile = async (e) => {
  let fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
  let selectedFile = e.target.files[0];

  if (selectedFile) {
    if (fileTypes.includes(selectedFile.type)) {
      setTypeError(null);

      if (selectedFile.type === 'text/csv') {
        // Handle CSV file
        let reader = new FileReader();
        reader.readAsText(selectedFile);
        reader.onload = (e) => {
          const data = e.target.result;
        localStorage.setItem('excelData', JSON.stringify(data.slice(0, 10)));
          console.log("Data from CSV", data);
          console.log("Successfully Data stored in Local Storage");

          const storedData = localStorage.getItem('excelData');
          const dataArray = storedData ? JSON.parse(storedData) : [];
          console.log("Data in Array Format", dataArray);
          setFormData(dataArray);
          dispatch(addExcelData(dataArray));

        };
      } else {


        // Handle Excel file
let reader = new FileReader();
reader.readAsArrayBuffer(selectedFile);

reader.onload = async (e) => {
  setExcelData(e.target.result);

  const workbook = await readXlsxFile(e.target.result);
  const data = workbook.slice(0, 10);


// Extract headers (assuming the first row contains headers)
const headers = data[0];

// Remove the first row (headers) from the data array
const dataArrayWithoutHeaders = data.slice(1);

// Convert array of arrays to array of objects
const jsonArray = dataArrayWithoutHeaders.map((row) => {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
});
// ---------------------Data will change into  Json format and store it in local storage-------------------------

console.log("Array of objects",jsonArray);

localStorage.setItem('Array of array into json format ', JSON.stringify(jsonArray));
console.log("Successfully JsonData stored in Local Storage");
setExcelData(jsonArray);

dispatch(addExcelData(jsonArray));


  // // Store the JSON string directly in local storage
  // localStorage.setItem('excelData', JSON.stringify(data));

  // console.log("Data from Excel", data);
  // // console.log("Data Format:", typeof data);  // It will print "object"
  // console.log("Successfully Data stored in Local Storage");

  // const storedData = localStorage.getItem('excelData');
  // const dataArray = storedData ? JSON.parse(storedData) : [];
  // console.log("Data in Array Format", dataArray); 
  // // console.log("Data Format:", typeof dataArray);  // It will print "object"

};

      }
    } else {
      setTypeError('Please select only CSV or Excel file types');
      setExcelData(null);
    }
  } else {
    console.log('Please select your file');
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log("handlechange data stored");

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

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // addData(); 
    console.log("Call addData to dispatch both form and Excel data");

    await submitForm(formData,excelData);

      console.log("Connection successfull");

    if (validateForm()) {

      console.log("Form Data:", formData);
      console.log("Excel Data:", excelData);

    } else {
      console.log("Form has errors. Please fix them.");
    }

  };

// ----------------------------Connect React frontend---------------------------

  // Example using fetch
const submitForm = async (formData,excelData) => {
  try {
    const requestBody = { 
      emp: formData,
      excelData: excelData,
      
    };
    console.log('Request Body:', JSON.stringify(requestBody)); 

      const response = await fetch('http://localhost:9090/api/form/create' , {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },  
          body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
          console.log('Form and Excel data submitted successfully');
          console.log(formData);
          console.log(excelData);

      } else {
        console.log("Server side excel data : ",excelData);
          console.error('Failed to submit form data');
      }
  } catch (error) {
      console.error('An error occurred:', error);
  }
};

// -----------------------------------------Retrive fromdatabase---------------------------------------

const fetchDataFromDatabase = async () => {
  try {
    const response = await fetch('http://localhost:9090/api/form/get');
    if (response.ok) {
      const data = await response.json();
      setRetrievedData(data);
      console.log('Data retrieved successfully:', data);
    } else {
      console.error('Failed to retrieve data from the database');
    }
  } catch (error) {
    console.error('An error occurred while fetching data:', error);
  }
};











  return (
    <div className="o-form">
    <div className="main">
      <form onSubmit={handleSubmit}>
       <div>
          <label htmlFor="fname">First Name</label>
          <input
            type="text"
            name="firstName"
            id="fname"
            value={formData.firstName}
            onChange={handleChange }
          />
        </div>
        <div className="error">{errors.firstName}</div>

        <div>
          <label htmlFor="lname">Last Name</label>
          <input
            type="text"
            id="lname"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="error">{errors.lastName}</div>

        <div>
          <label htmlFor="email">Email ID</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter the email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="error">{errors.email}</div>

        <div>
          <label htmlFor="pass">Password</label>
          <input
            type="password"
            id="pass"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="error">{errors.password}</div>  
        <label htmlFor="csvin">Upload CSV or Excel File</label>
         <input type="file" className="form-control" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" required onChange={handleFile} />

    
        

         {/* <button type="submit" className="butn">Submit</button> */}
         <button type="submit" onClick={addData} className="butn">Submit</button>
         <button onClick={fetchDataFromDatabase}>Get Data</button>

        </form>








    </div>

    <div>
  {retrievedData && (
    <ul>
      {retrievedData.map((item) => (
        <li key={item.id}>
          <div>
            <p>First Name: {item.firstName}</p> 
            <p>Last Name: {item.lastName}</p>
            <p>Email: {item.email}</p>
            <p>Password: {item.password}</p>
            
            {item.excelData && item.excelData.length > 0 && (
              <div>
                <p>Excel Data:</p>
                <table>
                  <thead>
                    <tr>
                      {Object.keys(item.excelData[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.excelData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )}
</div>


    <div className="render-data">
    {typeError&&(
          <div className="alert alert-danger" role="alert">{typeError}</div>
        )}

<div className="viewer">
        {excelData && Array.isArray(excelData)?(
          <div className="table-responsive">
            <table className="table">

              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key)=>(
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {excelData.map((individualExcelData, index)=>(
                  <tr key={index}>
                    {Object.keys(individualExcelData).map((key)=>(
                      <td key={key}>{individualExcelData[key]}</td>
                    ))}
                  </tr>  
                ))}
              </tbody>

            </table>
          </div>
        ):(
          <div>No File is uploaded yet!</div>
        )}
      </div>   

    </div>
    </div>
  );
}

export default Form;
