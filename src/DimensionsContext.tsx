import { createContext, ReactNode, useContext } from "react";
import { useWindowSize } from "./hooks/useWindowSize";
import { useDebounced } from "./hooks/useDebounced";

// px size of a single cell (Tailwind w-10 / h-10)
export const CELL_SIZE = 40;
// px max width of the centered content column below the header
export const CONTENT_MAX_WIDTH = 1600;

// board dimensions in cells, derived from the window and shared by every board.
// contentCols is how many whole cells fit in the padded content column below the header
type Dimensions = { width: number; height: number; windowWidth: number; contentCols: number };

const DimensionsContext = createContext<Dimensions>({ width: 0, height: 0, windowWidth: 0, contentCols: 0 });

export const DimensionsProvider = ({ children }: { children: ReactNode }) => {
  const size = useWindowSize();
  const debounced = useDebounced(size, 200);
  const width = Math.floor(debounced.width / CELL_SIZE);
  const height = Math.floor(debounced.height / CELL_SIZE);
  // matches the px-5 md:px-10 padding on the content column in App
  const padding = debounced.width >= 768 ? 40 : 20;
  const contentCols = Math.floor((Math.min(debounced.width, CONTENT_MAX_WIDTH) - 2 * padding) / CELL_SIZE);

  return (
    <DimensionsContext.Provider value={{ width, height, windowWidth: debounced.width, contentCols }}>
      {children}
    </DimensionsContext.Provider>
  );
};

export const useDimensions = () => useContext(DimensionsContext);
