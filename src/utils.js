import React, { createContext, useCallback, useState } from 'react';
import search from './icons/search.png'
import refresh from './icons/refresh.png'
import classes from './App.module.css'


export const customImage = (source, size = 'small') => {

	// Check the source and set iconClass accordingly
	let iconClass = '';
	iconClass = size === 'small' ? classes.smallIcon : size === 'large' ? classes.largeIcon : classes.smallIcon;
	if (source.toLowerCase() === 'search') {
		return <img src={search} className={iconClass}/>
	}
	if (source.toLowerCase() === 'refresh') {
		return <img src={refresh} className={iconClass}/>
	}

}

export const createOrUpdateDataStore = async (engine, postObject, store, key, mode = '') => {

	if (!postObject.hasOwnProperty('modifiedDate')) {
		// If it doesn't exist, add it to the object
		postObject.modifiedDate = modifiedDate();
	} else {
		// If it exists, update its value
		postObject.modifiedDate = modifiedDate();
	}
	let modeType = ''

	if (mode === 'create') {
		if (!postObject.hasOwnProperty('createdDate')) {
			// If it doesn't exist, add it to the object
			postObject.createdDate = modifiedDate();
		} else {
			// If it exists, update its value
			postObject.createdDate = modifiedDate();
		}
		modeType = true
	} else if (mode === 'update') {
		modeType = false
	}

	try {

		const result = await engine.mutate({
			resource: `dataStore/${store}/${key}`,
			type: modeType ? 'create' : 'update',
			data: postObject,
		});
		// console.log('Mutation successful:', result);
		return result;
	} catch (error) {
		console.error('Error creating or updating object:', error);
		// throw error;

	}
}

export const createMetadata = async (engine, postObject, mode) => {
	try {
		const result = await engine.mutate({
			resource: 'metadata',
			type: 'create',
			// partial: true,
			data: postObject,
		});
		return {success: true, message: result};
	} catch (error) {
		return {success: false, message: error};
	}
}

export const updateTrackedEntityIgnore = async (engine, teiUpdate, tei_value, payload) => {
	// get the values of the json object
	const ignore_values = Object.values(teiUpdate);
	console.log('******** ignore_values **********')
	console.log(ignore_values)
	// if ('score' in tei_value || 'matches' in tei_value) {
	//   if ('score' in tei_value) {
	//       delete tei_value.score;
	//   }
	//   if ('matches' in tei_value) {
	//       delete tei_value.matches;
	//   }
	// }

	const trackedEntities = ignore_values.map(item => item.trackedEntity);
	console.log(trackedEntities)
	const ignoreAttr = {
		"attribute": "sher1dupli1",
		"displayName": "Ignored duplicate",
		"valueType": "LONG_TEXT",
		"value": trackedEntities.join(';')

	}


	console.log('ignoreAttr: ', ignoreAttr);
	const exist = payload.enrollments[0].attributes.filter(attr => attr.attribute === "sher1dupli1") || []
	// if (exist.length === 0){
	payload.enrollments[0].attributes.push(ignoreAttr)
	console.log('payload:', payload)
	const events = payload?.enrollments[0]?.events || [];
	console.log('events:', events)

	if ('events' in payload.enrollments[0]) {
		delete payload.enrollments[0].events;
	}

	const nestedPayload = {

		"trackedEntities": [
			{
				"orgUnit": payload.orgUnit,
				"trackedEntity": payload.trackedEntity,
				"trackedEntityType": payload.trackedEntityType,
				"attributes": payload.enrollments[0].attributes,
			}
		]
		// "enrollments": payload.enrollments,
		// "events": events,
		// "relationships": payload?.relationships || []
	}

	const flatPayload = {
		"trackedEntities": [
			{
				"orgUnit": payload.orgUnit,
				"trackedEntity": payload.trackedEntity,
				"trackedEntityType": payload.trackedEntityType,
				"relationships": payload?.relationships || [],
				"enrollments": payload.enrollments,
				"programOwners": payload.programOwners
			}
		],

	}
	console.log('nestedPayload: ', nestedPayload)
	const mode = 'update'
	try {
		const response = await engine.mutate({
			resource: 'tracker',
			type: mode ? 'create' : 'update',
			partial: true,
			// async:false,
			data: nestedPayload

		});
		console.log('trackedEntity update response:', response);
		// successMessage();
		//handleCloseModal();
	} catch (error) {
		// errorMessage(error)
		console.error('trackedEntity error response: ' + error);
	}
	// }
}

export const delete_tei = async (engine, tei) => {

	try {
		const response = await engine.mutate({
			resource: `trackedEntityInstances/${tei}`,
			type: 'delete',
		});
		return true
		// console.log('Delete response:', response);
		// successMessage();
		//handleCloseModal();
	} catch (error) {
		// errorMessage(error)
		return false
		// console.error('Error deleting Object : ' + tei, error);
	}

}
export const generateRandomId = () => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const idLength = 11;
	let randomId = '';

	for (let i = 0; i < idLength; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomId += characters.charAt(randomIndex);
	}

	return randomId;
};

export const modifiedDate = () => {
	const now = new Date();

	return now.toISOString();
};

export const provisionOUs = (selectedOU) => {

	const OrgUnitsSelected = selectedOU.map(path => {
		const items = path.split('/');
		return items[items.length - 1];
	});
	return OrgUnitsSelected;
}

export const deleteObjects = async (engine, store, key, obj) => {

	try {
		await engine.mutate({
			resource: `dataStore/${store}/${key}`,
			type: 'delete',
		});
		console.log(`${obj} ${key} deleted`);
		return true
	} catch (error) {
		console.error(`Error deleting ${key}`, error);
		return false
	}
}

export const trimNameToMax50Chars = (name) => {

	const maxNameLength = 50;
	return name.trim().slice(0, maxNameLength);
}

/** for routing and contexting */
export const SharedStateContext = createContext({
	selectedSharedOU: [],
	setSelectedSharedOU: () => {
	},
	selectedSharedAttr: [],
	setSelectedSharedAttr: () => {
	},
	selectedSharedProgram: [],
	setSelectedSharedProgram: () => {
	},
	fullOrgUnitSharedSearch: false,
	setFullOrgUnitSharedSearch: () => {
	},
	selectedSharedProgramName: [],
	setSelectedSharedProgramName: () => {
	},
	selectedOUSharedforQuery: [],
	setSelectedSharedOUforQuery: () => {
	},
	matchingSharedThreshold: 0.6,
	setMatchingSharedThreshold: () => {
	},
	matchingSharedThresholdWeight: 1e-20,
	setMatchingSharedThresholdWeight: () => {
	},
	persistSharedData: [],
	setPersistSharedData: () => {
	},
	setExactMatching: () => {
	},
	exactMatching: false,
})

export const useSharedState = () => {
	const [selectedSharedOU, setSelectedSharedOU_] = useState([]);
	const [selectedSharedAttr, setSelectedSharedAttr_] = useState([]);
	const [selectedSharedProgram, setSelectedSharedProgram_] = useState([]);
	const [selectedSharedProgramName, setSelectedSharedProgramName_] = useState([]);
	const [selectedOUSharedforQuery, setSelectedSharedOUforQuery_] = useState([]);
	const [fullOrgUnitSharedSearch, setFullOrgUnitSharedSearch_] = useState(false);
	const [matchingSharedThreshold, setMatchingSharedThreshold_] = useState(0.6);
	const [matchingSharedThresholdWeight, setMatchingSharedThresholdWeight_] = useState(1e-20);
	const [persistSharedData, setPersistSharedData_] = useState([]);
	const [exactMatching, setExactMatching_] = useState(false);


	// memoizedCallbacks
	/**
	 * preventing unnecessary re-renders of child components when
	 * the callback reference remains unchanged. It optimizes performance by
	 * avoiding the recreation of callbacks on each render
	 *
	 */
	const setSelectedSharedOU = useCallback((data) => {
		setSelectedSharedOU_(data)
	}, [])
	const setSelectedSharedAttr = useCallback((data) => {
		setSelectedSharedAttr_(data)
	}, [])
	const setSelectedSharedProgram = useCallback((data) => {
		setSelectedSharedProgram_(data)
	}, [])
	const setSelectedSharedProgramName = useCallback((data) => {
		setSelectedSharedProgramName_(data)
	}, [])
	const setSelectedSharedOUforQuery = useCallback((data) => {
		setSelectedSharedOUforQuery_(data)
	}, [])
	const setFullOrgUnitSharedSearch = useCallback((data) => {
		setFullOrgUnitSharedSearch_(data)
	}, [])
	const setMatchingSharedThreshold = useCallback((data) => {
		setMatchingSharedThreshold_(data)
	}, [])
	const setMatchingSharedThresholdWeight = useCallback((data) => {
		setMatchingSharedThresholdWeight_(data)
	}, [])
	const setPersistSharedData = useCallback((data) => {
		setPersistSharedData_(data)
	}, [])
	const setExactMatching = useCallback((data) => {
		setExactMatching_(data)
	}, [])

	return {
		selectedSharedOU,
		setSelectedSharedOU,
		selectedSharedAttr,
		setSelectedSharedAttr,
		selectedSharedProgram,
		setSelectedSharedProgram,
		fullOrgUnitSharedSearch,
		setFullOrgUnitSharedSearch,
		selectedSharedProgramName,
		setSelectedSharedProgramName,
		selectedOUSharedforQuery,
		setSelectedSharedOUforQuery,
		matchingSharedThreshold,
		setMatchingSharedThreshold,
		matchingSharedThresholdWeight,
		setMatchingSharedThresholdWeight,
		persistSharedData,
		setPersistSharedData,
		exactMatching,
		setExactMatching
	}
}
