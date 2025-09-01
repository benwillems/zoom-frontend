// Assuming Modal is the component you have
import { motion } from 'framer-motion';

const Modal = ({ children, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-auto bg-smoke-800 flex justify-center items-center"
    >
      <div className="bg-white p-6 rounded shadow-lg">
        <button onClick={onClose} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Close
        </button>
        {children}
      </div>
    </motion.div>
  );
};

export default Modal;
