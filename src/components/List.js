import React, { useState, useEffect } from "react";
import "./List.css";
// import readXlsxFile from 'read-excel-file';




function List() {
  const [retrievedData, setRetrievedData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

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
  
    // Initialize editedData for the selected item
    if (retrievedData && retrievedData[index] && retrievedData[index].excelData) {
      setEditedData((prevData) => {
        const newData = [...prevData];
        newData[index] = { excelData: [...retrievedData[index].excelData] };
        return newData;
      });
    } else {
      setEditedData([]);
    }
  };
  
  const handleEditSave = async () => {
    try {
      if (isEditing && selectedItem !== null && selectedItem !== undefined) {
        // Initialize editedData if it's null
        const currentEditedData = editedData || [];
        const selectedData = currentEditedData[selectedItem];
  
        if (selectedData && selectedData.excelData) {

            console.log("Employee ID:", retrievedData[selectedItem].id);
            const updatedData = selectedData.excelData.filter((_, rowIndex) => !deletedItems.includes(rowIndex));

          // Save changes to the database
          const response = await fetch("http://localhost:9090/api/form/update", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: retrievedData[selectedItem].id, 

                firstName: retrievedData[selectedItem].firstName,
                lastName: retrievedData[selectedItem].lastName,
                email: retrievedData[selectedItem].email, 
                password: retrievedData[selectedItem].password,
                excelData: updatedData,
            }),
          });
  
          if (response.ok) {
            console.log("Changes saved successfully");
            console.log("the changed data are : ",selectedData.excelData);
            console.log("the changed retrievedData: ",retrievedData[selectedItem].id);

            
          } else {
            console.error("Failed to save changes");
          }
        } else {
          console.error("editedData[selectedItem] or editedData[selectedItem].excelData is null or undefined");
        }
      }
      // Toggle editing state
      setIsEditing(!isEditing);
    } catch (error) {
        
      console.error("An error occurred while saving changes:", error);
    }
  };
  const handleDeleteRow = (rowIndex) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this row?");

    if (isConfirmed) {
        setDeletedItems((prevDeletedItems) => [...prevDeletedItems, rowIndex]);
      }  };
  
  
  const handleInputChange = (e, rowIndex, colIndex) => {
    try {
      if (editedData?.[selectedItem]?.excelData) { // Use optional chaining
        // Update the excel data
        const updatedData = [...editedData];
        const currentRow = updatedData[selectedItem];
        currentRow.excelData[rowIndex][Object.keys(currentRow.excelData[rowIndex])[colIndex]] = e.target.value;
        setEditedData(updatedData);
  
      } else {
        console.error("Data is not yet loaded or available for editing."); // Or handle the absence of data appropriately
      }
    } catch (error) {
    }
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
              <h2>EXCEL DATAS</h2>
              <button className="editbtn" onClick={handleEditSave}>
                {isEditing ? 'Save Changes' : 'Edit'}
              </button>

              {retrievedData[selectedItem].excelData ? (
                renderExcelData(retrievedData[selectedItem].excelData, isEditing)
              ) : (
                <div>No Excel data available for this user.</div>
              )}

            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  function renderExcelData(excelData, isEditing) {
    return (
      <div className="excel-container">
        <table className="table table-bordered table-hover">
          <thead className="thead-light">
            <tr>
              {Object.keys(excelData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
                          <th>Delete</th>

            </tr>
          </thead>
          <tbody>
            {excelData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                      />
                    ) : (
                      value instanceof Date
                        ? value.toLocaleDateString() // Convert Date to string
                        : value
                    )}
                  </td>
                ))}

                             
                <td>
                  <button className="delbtn" onClick={() => handleDeleteRow(rowIndex)}>Delete</button>
                </td>
              

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default List;
