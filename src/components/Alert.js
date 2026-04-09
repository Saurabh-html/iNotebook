import React from 'react';

const Alert = (props) => {

  const capitalize = (word) => {
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "70px",   
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        width: "90%",
        maxWidth: "500px"
      }}
    >
      {props.alert && (
        <div className={`alert alert-${props.alert.type} alert-dismissible fade show`} role="alert">
          <strong>{capitalize(props.alert.type)}</strong>: {props.alert.msg}
        </div>
      )}
    </div>
  );
};

export default Alert;