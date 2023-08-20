import { Plus, Minus } from "lucide-react";

interface ScaleButtonsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ScaleButtons: React.FC<ScaleButtonsProps> = ({ onZoomIn, onZoomOut }) => {
  const buttonStyle =
    "rounded-lg sm:p-2 p-1 sm:text-sm text-xs font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500 pointer-events-auto";

  return (
    <div className="flex w-12 flex-col space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-2 sm:w-full">
      <button type="button" className={buttonStyle} onClick={onZoomIn}>
        <Plus size={24} />
      </button>
      <div>
        <hr className="border-gray-300" />
      </div>
      <button type="button" className={buttonStyle} onClick={onZoomOut}>
        <Minus size={24} />
      </button>
    </div>
  );
};

export default ScaleButtons;
