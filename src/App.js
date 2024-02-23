// import logo from './logo.svg';
import './App.css';
import Form from './components/FormCSV';
import { Provider } from 'react-redux';
import { store } from './redux/store';

function App() {
  return (
    <Provider store={store}>

    <div className="App">
      <Form/>
    </div>
     </Provider>

  );
}

export default App;
