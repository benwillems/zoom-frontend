// import { createPortal } from 'react-dom';

// const Modal = ({ children, onClose }) => {
//   return createPortal(
//     <div className="fixed inset-0 flex items-center justify-center z-[9999]">
//       <div 
//         className="fixed inset-0 bg-black/50" 
//         onClick={onClose}
//       />
//       {children}
//     </div>,
//     document.body
//   );
// };

// export default Modal;




import { createPortal } from 'react-dom';

const Modal = ({ children, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      {children}
    </div>,
    document.body
  );
};

export default Modal;