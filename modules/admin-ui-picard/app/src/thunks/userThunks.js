import {loadUsersFailure, loadUsersInProgress, loadUsersSuccess} from "../actions/userActions";
import {getURLParams} from "../utils/resourceUtils";
import axios from "axios";
import {transformToIdValueArray} from "../utils/utils";

// fetch users from server
export const fetchUsers = () => async (dispatch, getState) => {
    try {
        dispatch(loadUsersInProgress());

        const state = getState();
        let params = getURLParams(state);

        // /users.json?limit=0&offset=0&filter={filter}&sort={sort}
        let data = await axios.get('admin-ng/users/users.json', { params: params });

        const users = await data.data;
        dispatch(loadUsersSuccess(users));

    } catch (e) {
        dispatch(loadUsersFailure());
    }
};

// get users and their user names
export const fetchUsersAndUsernames = async () => {

    let data = await axios.get('/admin-ng/resources/USERS.NAME.AND.USERNAME.json');

    const response = await data.data;

    return transformToIdValueArray(response);
};

// new user to backend
export const postNewUser = async values => {
    let data = new FormData();
    // fill form data with user inputs
    data.append('username', values.username);
    data.append('name', values.name);
    data.append('email', values.email);
    data.append('password', values.password);
    data.append('roles', JSON.stringify(values.roles));

    // POST request
    // todo: notification
    axios.post('/admin-ng/users', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(response => console.log(response)).catch(response => console.log(response));
};