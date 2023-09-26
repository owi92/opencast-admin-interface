import {
	createNotification,
  createNotificationWithId,
	removeNotification,
} from "../actions/notificationActions";
import { getLastAddedNotification } from "../selectors/notificationSelector";
import {
	ADMIN_NOTIFICATION_DURATION_ERROR,
	ADMIN_NOTIFICATION_DURATION_SUCCESS,
	ADMIN_NOTIFICATION_DURATION_WARNING,
} from "../configs/generalConfig";

// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
export const addNotification = (type, key, duration, parameter, context, id?) => (
// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
	dispatch,
// @ts-expect-error TS(7006): Parameter 'getState' implicitly has an 'any' type.
	getState
) => {
	if (!duration) {
		// fall back to defaults
		// eslint-disable-next-line default-case
		switch (type) {
			case "error":
				duration = ADMIN_NOTIFICATION_DURATION_ERROR;
				break;
			case "success":
				duration = ADMIN_NOTIFICATION_DURATION_SUCCESS;
				break;
			case "warning":
				duration = ADMIN_NOTIFICATION_DURATION_WARNING;
				break;
		}
	}
	// default durations are in seconds. duration needs to be in milliseconds
	if (duration > 0) duration *= 1000;

	if (!context) {
		context = "global";
	}

	if (!parameter) {
		parameter = {};
	}

	// Create new notification, id is set in action
	const notification = {
		type: type,
		key: key,
		message: "NOTIFICATIONS." + key,
		parameter: parameter,
		duration: duration,
		hidden: false,
		context: context,
	};
  var dispatchedNotification;
  if (!id) {
	  dispatchedNotification = dispatch(createNotification(notification));
  } else {
    dispatchedNotification = dispatch(createNotificationWithId(notification, id));
  }

	// Get newly created notification and its id
	let latestNotification = getLastAddedNotification(getState());

	// Fade out notification if it is not -1 -> -1 means 'stay forever'
	// Start timeout for fading out after time in duration is over
	if (
		parseInt(latestNotification.duration) &&
		parseInt(latestNotification.duration) !== -1
	) {
		setTimeout(
			() => dispatch(removeNotification(latestNotification.id)),
			latestNotification.duration
		);
	}

  return dispatchedNotification.payload.id;
};

// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
export const addNotificationWithId = (id, type, key, duration, parameter, context) => (
// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
	dispatch,
// @ts-expect-error TS(7006): Parameter 'dispatch' implicitly has an 'any' type.
	getState
) => {
    dispatch(addNotification(type, key, duration, parameter, context, id))
}