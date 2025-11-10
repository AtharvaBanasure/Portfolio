import './App.css';
import { GridPattern } from './components/ui/shadcn-io/grid-pattern';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="grid-container">
        <Hero />
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [15, 10],
            [10, 15],
            [15, 10],
          ]}
          className="grid-pattern"
        />
      </div>
    </div>
  );
}

export default App;
