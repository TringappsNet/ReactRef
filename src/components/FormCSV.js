import React, { useState } from "react";
import './FormCSV.css';

import { useDispatch } from "react-redux";
import { addFormData,addExcelData } from "../redux/slice";
import readXlsxFile from 'read-excel-file';



function Form() {
  const dispatch = useDispatch();
  const [typeError, setTypeError] = useState(null);
  // const [retrievedData, setRetrievedData] = useState(null);
  const [excelData, setExcelData] = useState(null);
  // const [loading, setLoading] = useState(false);

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
  
  
    } else {
      console.log("Failed to dispatch form data");
    }

    if (excelData) {
      dispatch(addExcelData(excelData));
      console.log("Excel data dispatched");


    } else {
      console.log("Failed to dispatch Excel data");
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
  const data = workbook;

const headers = data[0];
const dataArrayWithoutHeaders = data.slice(1);
const jsonArray = dataArrayWithoutHeaders.map((row) => {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = typeof header === 'string' && header.toLowerCase().includes('date')
    ? row[index].toLocaleString() 
    : row[index];
  });
  return obj;
});

// ---------------------Data will change into  Json format and store it in local storage-------------------------

console.log("Array of objects",jsonArray);

localStorage.setItem('Array of array into json format ', JSON.stringify(jsonArray));
console.log("Successfully JsonData stored in Local Storage");
setExcelData(jsonArray);

dispatch(addExcelData(jsonArray));



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

       // Format excelData before sending to the server
       const formattedExcelData = excelData.map((individualExcelData) => {
        const formattedData = {};
        Object.keys(individualExcelData).forEach((key) => {
          formattedData[key] = key.toLowerCase().includes('date') &&
            key.toLowerCase().includes('jan 23')
            ? formatDate(new Date(individualExcelData[key]))
            : key.toLowerCase().includes('date')
            ? ''
            : individualExcelData[key];
        });
        return formattedData;
      });
  
    const requestBody = { 
      emp: formData,
      excelData: formattedExcelData,
      
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
          console.log(formattedExcelData);
      } else {
        console.log("Server side excel data : ",formattedExcelData);
          console.error('Failed to submit form data');
      }
  } catch (error) {
      console.error('An error occurred:', error);
  }
};



function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}
function formatDateHeading(header) {
  const dateParts = header.match(/\b(\w{3} \d{2})\b/);
  return dateParts ? dateParts[0] : header;
}


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

            <div className="file-input-wrapper">
  <label className="file-input-label" htmlFor="fileInput">
    Upload CSV or Excel File
  </label>
  <input
    id="fileInput"
    type="file"
    className="form-control"
    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
    required
    onChange={handleFile}
  />
</div>

            <button type="submit" onClick={addData} className="butn">Submit</button>

           
        </form>
      </div>

      <div className="render-data">
      {typeError&&(
            <div className="alert alert-danger" role="alert">{typeError}</div>
          )}

        <div className="viewer">
        {excelData && Array.isArray(excelData) ? (
  <div className="table-responsive">
    <table className="table">
    <thead>
  <tr>
    {Object.keys(excelData[0]).map((key) => (
      <th key={key}>
        {formatDateHeading(key)}
      </th>
    ))}
  </tr>
</thead>


      <tbody>
        {excelData.map((individualExcelData, index) => (
          <tr key={index}>
            {Object.keys(individualExcelData).map((key) => (
               <td key={key}>
               {key.toLowerCase().includes('date') &&
               key.toLowerCase().includes('jan 23')
                 ? formatDate(new Date(individualExcelData[key]))
                 : key.toLowerCase().includes('date')
                 ? '' 
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

      </div>
    </div>
    
  );
        }
export default Form;
