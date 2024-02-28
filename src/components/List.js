import React, { useState, useEffect } from "react";
import "./List.css";

function List() {
  const [retrievedData, setRetrievedData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/form/get");
        if (response.ok) {
          const data = await response.json();
          setRetrievedData(data);
          console.log("Data retrieved successfully:", data);
        } else {
          console.error("Failed to retrieve data from the database");
        }
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleNameClick = (index) => {
    setSelectedItem(index);
  };

  return (






    <div className="container mt-4">
      <div className="row">
        <div className="col col1">
          <div className="text-center">
            {!retrievedData ? (
              <div>Loading data...</div>
            ) : retrievedData.length === 0 ? (
              <div>No data retrieved from the database.</div>
            ) : (
              <div className="d-flex flex-wrap">
                <h2>Data from Database:</h2>
                {retrievedData.map((data, index) => (
                  <div
                    key={data.id}
                    className={` ${selectedItem === index ? 'selected' : ''} mb-3`}
                    style={{ cursor: 'pointer', width: '100%' }}
                    onClick={() => handleNameClick(index)}
                  >

                    <div className="border p-3">
                      <h3>{`${data.firstName}`}</h3>
                    </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {selectedItem !== null && retrievedData ? (
          <div className="col">
            <div className="mt">
              <h2>Selected Excel Data:</h2>
              {retrievedData[selectedItem].excelData ? (
                renderExcelData(retrievedData[selectedItem].excelData)
              ) : (
                <div>No Excel data available for this user.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function renderExcelData(excelData) {
  return (
    <div className="excel-container">

    <table className="table table-bordered table-hover">
      <thead className="thead-light">
        <tr>
          {Object.keys(excelData[0]).map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
      {excelData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((value, colIndex) => (
                <td key={colIndex}>
                  {value instanceof Date
                    ? value.toLocaleDateString() // Convert Date to string
                    : value}
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
    </div>

  );
}

export default List;
