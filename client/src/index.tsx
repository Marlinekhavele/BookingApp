import React , { useState,useEffect,useRef } from "react";
import { render } from "react-dom";
import { ApolloClient, InMemoryCache, ApolloProvider,useMutation  } from '@apollo/client';
import {Affix , Spin,Layout } from "antd";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {AppHeader, Home, Host, Listing, Listings,Login, NotFound, User } from "./sections";
import {LOG_IN} from "./lib/graphql/mutations";
import {
  LogIn as LogInData,
  LogInVariables
} from "./lib/graphql/mutations/LogIn/__generated__/LogIn";
import { Viewer } from "./lib/types";
import { AppHeaderSkeleton,ErrorBanner } from "./lib/components";



import * as serviceWorker from "./serviceWorker";

import "./styles/index.css";

const client = new ApolloClient({
  uri: "/api",
  cache: new InMemoryCache(),

});

const initialViewer:Viewer = {
  id:null,
  token:null,
  avatar:null,
  hasWallet:null,
  didRequest:false
}

const App = () =>{
  const [viewer, setViewer] = useState<Viewer>(initialViewer);
  const [logIn, { error }] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: data => {
      if (data && data.logIn) {
        setViewer(data.logIn);
      }
    }
  });

  const logInRef = useRef(logIn);

  useEffect(() => {
    logInRef.current();
  }, []);

  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Booking" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
  ) : null;

  return (
    <Router>
      <Layout id="app">
      {logInErrorBannerElement}

      <Affix offsetTop={0} className="app__affix-header">
        <AppHeader viewer={viewer} setViewer={setViewer}/>
      </Affix>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route  exact path="/host" component={Host}/>
        <Route exact path="/listing/:id" component={Listing}/>
        <Route exact path="/listings/:location?" component={Listings}/>
        <Route exact path="/login" render={props => <Login {...props} setViewer={setViewer} />} />
        <Route  exact path="/user/:id" component={User}/>
        <Route  component={NotFound}/>
      </Switch>
      </Layout>
    </Router>
  )
}

render(
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>,
    document.getElementById("root")
  );
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
