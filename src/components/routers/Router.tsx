import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import { ROUTE_PATH } from 'constants/routePath';
import NotFound from 'pages/NotFound';
import Gantt from 'pages/Gantt';

import AuthenticatedRoutes from './AuthenticatedRoutes';
import UnauthenticatedRoutes from './UnauthenticatedRoutes';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AuthenticatedRoutes />}>
        {/* 대시보드 */}
        <Route path={`${ROUTE_PATH.gantt}/*`} element={<Gantt tasks={[]} />} />
      </Route>
      <Route element={<UnauthenticatedRoutes />}>
        <Route path={ROUTE_PATH.NOT_FOUND} element={<NotFound />} />
      </Route>
    </>,
  ),
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
