import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import NewsDetail from './pages/NewsDetail';
import ReportDetail from './pages/ReportDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'track/:trackId',
        element: <Dashboard />,
      },
      {
        path: 'news/:newsId',
        element: <NewsDetail />,
      },
      {
        path: 'report',
        element: <ReportDetail />,
      },
    ],
  },
]);
