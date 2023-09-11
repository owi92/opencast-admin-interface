import React from "react";
import { connect } from "react-redux";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import Notifications from "../../../shared/Notifications";
import {
	getAssetCatalogDetails,
	isFetchingAssets,
} from "../../../../selectors/eventDetailsSelectors";
import { humanReadableBytesFilter } from "../../../../utils/eventDetailsUtils";

/**
 * This component manages the catalog details sub-tab for assets tab of event details modal
 */
const EventDetailsAssetCatalogDetails = ({
// @ts-expect-error TS(7031): Binding element 'eventId' implicitly has an 'any' ... Remove this comment to see the full error message
	eventId,
// @ts-expect-error TS(7031): Binding element 't' implicitly has an 'any' type.
	t,
// @ts-expect-error TS(7031): Binding element 'setHierarchy' implicitly has an '... Remove this comment to see the full error message
	setHierarchy,
// @ts-expect-error TS(7031): Binding element 'catalog' implicitly has an 'any' ... Remove this comment to see the full error message
	catalog,
// @ts-expect-error TS(7031): Binding element 'isFetching' implicitly has an 'an... Remove this comment to see the full error message
	isFetching,
}) => {
// @ts-expect-error TS(7006): Parameter 'subTabName' implicitly has an 'any' typ... Remove this comment to see the full error message
	const openSubTab = (subTabName) => {
		setHierarchy(subTabName);
	};

	return (
		<div className="modal-content">
			{/* Hierarchy navigation */}
			<EventDetailsTabHierarchyNavigation
				openSubTab={openSubTab}
				hierarchyDepth={1}
				translationKey0={"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.TITLE"}
				subTabArgument0={"asset-catalogs"}
				translationKey1={"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.TITLE"}
				subTabArgument1={"catalog-details"}
			/>

			<div className="modal-body">
				{/* Notifications */}
				<Notifications context="not_corner" />

				{/* table with details for the catalog */}
				<div className="full-col">
					<div className="obj tbl-container operations-tbl">
						<header>
							{
								t(
									"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.CAPTION"
								) /* Catalog Details */
							}
						</header>
						<div className="obj-container">
							<table className="main-tbl">
								{isFetching || (
									<tbody>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.ID"
													) /* Id */
												}
											</td>
											<td>{catalog.id}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.TYPE"
													) /* Type */
												}
											</td>
											<td>{catalog.type}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.MIMETYPE"
													) /* Mimetype */
												}
											</td>
											<td>{catalog.mimetype}</td>
										</tr>
										{(!!catalog.size && catalog.size) > 0 && (
											<tr>
												<td>
													{
														t(
															"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.SIZE"
														) /* Size */
													}
												</td>
												<td>{humanReadableBytesFilter(catalog.size)}</td>
											</tr>
										)}
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.CHECKSUM"
													) /* Checksum */
												}
											</td>
											<td>{catalog.checksum}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.REFERENCE"
													) /* Reference */
												}
											</td>
											<td>{catalog.reference}</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.TAGS"
													) /* Tags */
												}
											</td>
											<td>
												{!!catalog.tags && catalog.tags.length > 0
													? catalog.tags.join(", ")
													: null}
											</td>
										</tr>
										<tr>
											<td>
												{
													t(
														"EVENTS.EVENTS.DETAILS.ASSETS.CATALOGS.DETAILS.URL"
													) /* Link */
												}
											</td>
											<td>
												<a className="fa fa-external-link" href={catalog.url} />
											</td>
										</tr>
									</tbody>
								)}
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Getting state data out of redux store
// @ts-expect-error TS(7006): Parameter 'state' implicitly has an 'any' type.
const mapStateToProps = (state) => ({
	isFetching: isFetchingAssets(state),
	catalog: getAssetCatalogDetails(state),
});

export default connect(mapStateToProps)(EventDetailsAssetCatalogDetails);
