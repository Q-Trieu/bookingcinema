
import { Route } from 'react-router';
import Home from './pages/public/home';

function App() {

  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/movies/:id" element={<Home />} />
      <Route path="/movies" element={<Home />} />
    </>
  )
  
}

export default App
