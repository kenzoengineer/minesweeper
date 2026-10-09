import Header from "./Header";
import { CONTENT_MAX_WIDTH, DimensionsProvider } from "./DimensionsContext";
import Career from "./Career";
import Tetris from "./tetris/Tetris";

function App() {
  return (
    <DimensionsProvider>
      <Header />
      <main className="bg-[#1f1f1f]">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
          <Career />
          <Tetris />
        </div>
      </main>
    </DimensionsProvider>
  );
}

export default App;
