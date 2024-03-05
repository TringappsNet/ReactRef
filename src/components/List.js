import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./List.css";

function List() {
  const [retrievedData, setRetrievedData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [editingCell, setEditingCell] = useState(null);

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
        const currentEditedData = editedData || [];
        const selectedData = currentEditedData[selectedItem];

        if (selectedData && selectedData.excelData) {
          const updatedData = selectedData.excelData.filter((_, rowIndex) => !deletedItems.includes(rowIndex));

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
            console.log("the changed data are : ", selectedData.excelData);
            console.log("the changed retrievedData: ", retrievedData[selectedItem].id);
          } else {
            console.error("Failed to save changes");
          }
        } else {
          console.error("editedData[selectedItem] or editedData[selectedItem].excelData is null or undefined");
        }
      }
      setIsEditing(!isEditing);
      setEditingCell(null);

    } catch (error) {
      console.error("An error occurred while saving changes:", error);
    }
  };

  const handleDeleteRow = async (rowIndex) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this row?");

    if (isConfirmed) {
        try {
            const response = await fetch(`http://localhost:9090/api/form/delete/${retrievedData[selectedItem].id}/${rowIndex}`, {
                method: "DELETE",
            });

            if (response.ok) {
                console.log("Row deleted successfully");
                setRetrievedData((prevData) => {
                  const newData = [...prevData];
                  const selectedUserData = newData[selectedItem];
                  if (selectedUserData.excelData) {
                      selectedUserData.excelData.splice(rowIndex, 1);
                  }
                  return newData;
              });
            } else {
                console.error("Failed to delete row");
            }
        } catch (error) {
            console.error("An error occurred while deleting row:", error);
        }
    }
};






  const handleInputChange = (e, rowIndex, colIndex) => {
    try {
      if (editedData?.[selectedItem]?.excelData) {
        const updatedData = [...editedData];
        const currentRow = updatedData[selectedItem];
        currentRow.excelData[rowIndex][Object.keys(currentRow.excelData[rowIndex])[colIndex]] = e.target.value;
        setEditedData(updatedData);
      } else {
        console.error("Data is not yet loaded or available for editing.");
      }
    } catch (error) {
      console.error("An error occurred while handling input change:", error);
    }
  };



  const handleDoubleClick = (rowIndex, colIndex) => {
    setIsEditing(true);
    setEditingCell({ rowIndex, colIndex });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEditSave();
    }
  };
  return (
    <div className="container-fluid">
      <div className="row">
        <nav id="sidebarMenu" className="col-2 d-md-block bg-light mt-5 p-0 pt-0 sidebar">
          <div className="position-sticky">
            <div className="list-group list-group-flush mx-3 mt-4">
              {retrievedData && retrievedData.map((data, index) => (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a
                  key={data.id}
                  href="#"
                  className={`list-group-item list-group-item-action py-2 ripple ${selectedItem === index ? 'active' : ''}`}
                  onClick={() => handleNameClick(index)}
                >
                  <i className="fas fa-user fa-fw me-3"></i>
                  <span>{data.firstName + data.lastName}</span>
                </a>
                
                
              ))}
            </div>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 mt-5">
          <div className="mt-5" style={{ fontFamily: 'Your Font Family', fontSize: 'Your Font Size', color: 'Your Font Color' }}>
            {/* <h2>EXCEL DATAS</h2> */}
            {/* <button className={`btn ${isEditing ? 'btn-success' : 'btn-primary'} mt-5 mb-5 `} onClick={handleEditSave}>
              {isEditing ? 'Save Changes' : 'Edit'}
            </button> */}

            {selectedItem !== null && retrievedData ? (
              <div className="sticky-top">
                {retrievedData[selectedItem].excelData ? (
                  renderExcelData(retrievedData[selectedItem].excelData, isEditing)
                ) : (
                  <div>No Excel data available for this user.</div>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
  function formatDateHeading(header) {
    const dateParts = header.match(/\b(\w{3} \d{2})\b/);
    return dateParts ? dateParts[0] : header;
  }

  function renderExcelData(excelData, isEditing) {
    return (
      <div className="excel-container">
        <table className="table table-bordered table-hover">
          <thead className="thead-light">
          <tr>
            {Object.keys(excelData[0]).map((key) => (
              <th key={key}>{formatDateHeading(key)}</th>
            ))}
            <th>Delete</th>
          </tr>
          </thead>
          <tbody>
            {excelData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td
                    key={colIndex}
                    onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)}
                    onKeyDown={handleKeyDown}
                    tabIndex="0"

                    className={(editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex) ? 'editing' : ''}
                  >
                    {isEditing && editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex ? (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                        autoFocus
                        style={{ border: 'none', outline: 'none' }}
                        />
                    ) : (
                      value instanceof Date ? value.toLocaleDateString() : value
                    )}      
                  </td>
                ))}
                <td>
                  <button className="btn btn-danger" onClick={() => handleDeleteRow(rowIndex)}>
                    Delete
                  </button>
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
