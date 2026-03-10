import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import LinkBio from './LinkBio.jsx';
import Cart from './Cart.jsx';
import Register from './Register.jsx';
import Checkout from './Checkout.jsx';
import Confirmation from './Confirmation.jsx';
import Terms from './Terms.jsx';
import Privacy from './Privacy.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bio" element={<LinkBio />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="/privacidade" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
