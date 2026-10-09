import Header from "./Header";
import { CELL_SIZE, DimensionsProvider, useDimensions } from "./DimensionsContext";
import Career from "./Career";
import Skills from "./Skills";

const Content = () => {
  const { contentCols } = useDimensions();
  return (
    <div className="mx-auto" style={{ width: contentCols * CELL_SIZE }}>
      <Career />
      <Skills />
    </div>
  );
};

function App() {
  return (
    <DimensionsProvider>
      <Header />
      <main className="bg-[#1f1f1f]">
        <Content />
      </main>
    </DimensionsProvider>
  );
}

export default App;
