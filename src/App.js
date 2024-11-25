import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import ConfigurationComponent from './components/ConfigurationComponent.js';
import { Main } from './components/main/Main.js';
import {customImage} from './utils'
import { footerText } from './consts.js';
import classes from './App.module.css'
import SetupStateProvider from './SetupStateProvider.js';
import './index.css';

const MyApp = () => (
    <SetupStateProvider>
        <HashRouter>
            <div className="flex flex-col min-h-screen">
                <div className="w-full bg-white">
                    <Routes>
                        <Route
                            exact
                            path="/"
                            element={<Main/>}
                        />
                        <Route
                            configure
                            exact
                            path="/configure"
                            element={<ConfigurationComponent/>}
                        />
                        {/* defaulting if unmatched */}
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </div>
            </div>
            <footer>
                <div className="flex flex-col items-center">
                        {customImage('logo')}
                        <p className="mx-auto font-semibold">{footerText}</p>
                    </div>
            </footer>
        </HashRouter>
    </SetupStateProvider>
)

export default MyApp
