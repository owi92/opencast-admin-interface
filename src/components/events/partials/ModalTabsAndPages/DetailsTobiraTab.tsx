import { useTranslation } from "react-i18next";
import Notifications from "../../../shared/Notifications";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getSeriesDetailsTobiraData, getSeriesDetailsTobiraDataError, getTobiraTabHierarchy } from "../../../../selectors/seriesDetailsSelectors";
import { addNotification, removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import { NOTIFICATION_CONTEXT } from "../../../../configs/modalConfig";
import { getEventDetailsTobiraData, getEventDetailsTobiraDataError } from "../../../../selectors/eventDetailsSelectors";
import { Formik } from "formik";
import { useState } from "react";
import EventDetailsTabHierarchyNavigation from "./EventDetailsTabHierarchyNavigation";
import NewTobiraPage, { TobiraFormProps } from "./NewTobiraPage";
import { fetchSeriesDetailsTobira, setTobiraTabHierarchy, TobiraData, updateSeriesTobiraData } from "../../../../slices/seriesDetailsSlice";
import { fetchSeriesDetailsTobiraNew, TobiraPage } from "../../../../slices/seriesSlice";


export type TobiraTabHierarchy = "main" | "edit-path";

/**
 * This component renders the Tobira tab for new series and events
 * in their respective details modal.
 */
type DetailsTobiraTabProps = {
	kind: "series" | "event";
	id: string;
}
const DetailsTobiraTab: React.FC<DetailsTobiraTabProps> = ({ kind, id }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const tabHierarchy = useAppSelector(state => getTobiraTabHierarchy(state));

	const [initialValues, setInitialValues] = useState<TobiraFormProps>({
		breadcrumbs: [],
	});

	const tobiraData = useAppSelector(state => kind === "series"
		? getSeriesDetailsTobiraData(state)
		: getEventDetailsTobiraData(state)
	);
	const error = useAppSelector(state => kind === "series"
		? getSeriesDetailsTobiraDataError(state)
		: getEventDetailsTobiraDataError(state)
	);
	
	const i18nKey = kind === "series" ? "SERIES" : "EVENTS";
	const prefix = kind === "series" ? "s" : "v";
	const directTobiraLink = tobiraData.baseURL + `/!${prefix}/:` + id;

	const getBreadcrumbs = async (currentPage: TobiraPage): Promise<TobiraPage[]> => {
		const homepage: TobiraPage = await dispatch(fetchSeriesDetailsTobiraNew("/"))
			.then(res => res.payload);

		return [homepage, ...currentPage.ancestors, currentPage];
	}

	const copyTobiraDirectLink = () => {
		navigator.clipboard.writeText(directTobiraLink).then(function () {
			dispatch(addNotification({
				type: "info",
				key: "TOBIRA_COPIED_DIRECT_LINK",
				duration: 3000,
				parameter: undefined,
				context: NOTIFICATION_CONTEXT
			}));
		}, function () {
			dispatch(addNotification({
				type: "error",
				key: "TOBIRA_FAILED_COPYING_DIRECT_LINK",
				duration: 3000,
				parameter: undefined,
				context: NOTIFICATION_CONTEXT
			}));
		});
	}

	const handleSubmit = async (values: TobiraFormProps) => {
		await dispatch(updateSeriesTobiraData({
			seriesId: id,
			currentPath: values.currentPath,
			selectedPage: values.selectedPage,
			breadcrumbs: values.breadcrumbs,
		}));

		if (values.selectedPage?.path) {
			await dispatch(fetchSeriesDetailsTobira(id));
		}
		dispatch(setTobiraTabHierarchy("main"));
	};

	const openSubTab = async (tabType: TobiraTabHierarchy, currentPage: TobiraPage) => {
		if (currentPage !== undefined) {
			const breadcrumbs = await getBreadcrumbs(currentPage);
			setInitialValues({
				...initialValues,
				currentPath: currentPage.path,
				breadcrumbs,
			});
			await dispatch(fetchSeriesDetailsTobiraNew(currentPage.path));
		}

		dispatch(setTobiraTabHierarchy(tabType));
	};

	return <>
		<div className="modal-content">
			{tabHierarchy === "edit-path" && <EventDetailsTabHierarchyNavigation
				openSubTab={openSubTab}
				hierarchyDepth={0}
				translationKey0={"EVENTS.SERIES.DETAILS.TOBIRA.SHOW_PAGES"}
				subTabArgument0={"main"}
			/>}
			{tabHierarchy === "main" && <div className="modal-body">
				{/* Notifications */}
				<Notifications context="not_corner" />
				{!error && <>
					<div className="tab-description">
						<a href={directTobiraLink}>
							{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.DIRECT_LINK`)}
						</a>
						<button
							className="tobira-copy-direct-link"
							onClick={() => copyTobiraDirectLink()}
							aria-label={t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.COPY_DIRECT_LINK`)}
						>
							<i
								aria-hidden="true"
								className="fa fa-copy"
								title={t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.COPY_DIRECT_LINK`)}
							/>
						</button>
					</div>
					{kind === "series" && <p className="tab-description">
						{t("EVENTS.SERIES.DETAILS.TOBIRA.DESCRIPTION")}
					</p>}
					<div className="obj-container">
						<div className="obj tbl-list">
							<header>
								{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.PAGES`)}
							</header>
							<div className="obj-container">
								<TobiraTable {...{ tobiraData, i18nKey, openSubTab }} />
							</div>
						</div>
					</div>
				</>}
			</div>}
		</div>
		{tabHierarchy === "edit-path" && (
			<Formik
				initialValues={initialValues}
				validationSchema={undefined}
				onSubmit={values => handleSubmit(values)}
			>
				{formik => <NewTobiraPage
					editMode
					formik={formik}
					nextPage={() => {}}
					previousPage={() => {}}
				/>}
			</Formik>
		)}
	</>;
}

type TobiraTableProps = {
	tobiraData: TobiraData;
	i18nKey: "SERIES" | "EVENTS";
	openSubTab: (tabType: TobiraTabHierarchy, currentPage: TobiraPage) => Promise<void>
};

const TobiraTable: React.FC<TobiraTableProps> = ({ tobiraData, i18nKey, openSubTab }) => {
	const { t } = useTranslation();
	return <table className="main-tbl">
		<tbody>
			{tobiraData.hostPages.length === 0 && <tr>
				<td className="tobira-not-mounted">
					{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.NOT_MOUNTED`)}
				</td>
			</tr>}
			{tobiraData.hostPages.map(hostPage => <tr key={hostPage.path}>
				<td>
					<a href={tobiraData.baseURL + hostPage.path}>
						{hostPage.path !== '/' && <>
							<span className="tobira-page-separator">/</span>
							{hostPage.ancestors.map((ancestor, key) => (
								<span key={key}>
									{ancestor.title}
									<span className="tobira-page-separator">/</span>
								</span>
							))}
						</>}
						<span className="tobira-leaf-page">
							{hostPage.path !== '/' && <span>
								{hostPage.title}
							</span>}
							{hostPage.path === '/' && <span>
								{t(`EVENTS.${i18nKey}.DETAILS.TOBIRA.HOMEPAGE`)}
							</span>}
						</span>
					</a>
					{i18nKey === "SERIES" && hostPage.blocks?.length === 1 && <button 
						style={{ margin: 5 }}
						className="button-like-anchor details-link pull-right"
						onClick={() => openSubTab("edit-path", hostPage)}
					>
						{t("EVENTS.SERIES.DETAILS.TOBIRA.EDIT_PATH")}
					</button>}
				</td>
			</tr>)}
		</tbody>
	</table>;
};

export default DetailsTobiraTab;
