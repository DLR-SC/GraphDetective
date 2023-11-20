import React, { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import LinearProgress from '@mui/material/LinearProgress';
import Alert, { AlertColor } from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import {
    DataGrid, gridClasses, GridRenderCellParams,
    getGridNumericOperators, getGridStringOperators, getGridDateOperators, GridFilterOperator, GridFilterModel, GridSortModel, GridColumnHeaderParams, GridToolbar
} from '@mui/x-data-grid';
//@ts-ignore
import { GET_COLLECTION_COUNT, GET_COLLECTION_COLUMN_DEF, GET_PAGE_COLLECTIONS } from '../../backend/services/collection.tsx';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import ReactJson from 'react-json-view'


const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .ant-empty-img-1': {
        fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626',
    },
    '& .ant-empty-img-2': {
        fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959',
    },
    '& .ant-empty-img-3': {
        fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343',
    },
    '& .ant-empty-img-4': {
        fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c',
    },
    '& .ant-empty-img-5': {
        fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
        fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff',
    },
}));

function CustomNoRowsOverlay() {
    return (
        <StyledGridOverlay>
            <svg
                width="120"
                height="100"
                viewBox="0 0 184 152"
                aria-hidden
                focusable="false"
            >
                <g fill="none" fillRule="evenodd">
                    <g transform="translate(24 31.67)">
                        <ellipse
                            className="ant-empty-img-5"
                            cx="67.797"
                            cy="106.89"
                            rx="67.797"
                            ry="12.668"
                        />
                        <path
                            className="ant-empty-img-1"
                            d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                        />
                        <path
                            className="ant-empty-img-2"
                            d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                        />
                        <path
                            className="ant-empty-img-3"
                            d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                        />
                    </g>
                    <path
                        className="ant-empty-img-3"
                        d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                    />
                    <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
                        <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
                        <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
                    </g>
                </g>
            </svg>
            <Box sx={{ mt: 1 }}>No Rows</Box>
        </StyledGridOverlay>
    );
}

function ExpandableCell({ value }: GridRenderCellParams) {
    const [expanded, setExpanded] = React.useState(false);
    const displayLimit = 200
    if (value === undefined) {
        return <div></div>
    }
    if (typeof value === "object") {
        return (
            <Box>
                <ReactJson
                style={{
                    textAlign: "left",
                    padding: "1em",
                    boxShadow: "0 0 0 rgba(0, 0, 0, 0.4), 0 6px 20px 0 rgba(0, 0, 0, 0.05)",
                    border: "1px dashed black"
                }}
                src={value}
                indentWidth={8}
                iconStyle="square"
                displayDataTypes={false}
                //theme="bright:inverted"
                theme="rjv-default"
                collapsed={0}
            />
            </Box>
        );  
    }
    value = String(value)
    return (
        <Box>
            {expanded ? value : value.slice(0, displayLimit)}&nbsp;
            {value.length > displayLimit && (
                <Link
                    type="button"
                    component="button"
                    sx={{ fontSize: 'inherit' }}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'view less' : 'view more'}
                </Link>
            )}
        </Box>
    );
}

export const CollectionGrid: React.FC<any> = ({ insightsData }) => {
    const [totalRowCount, setTotalRowCount] = useState<number>(0);
    const [columnDefinition, setColumnDefinition] = useState([]);
    const [rows, setRows] = useState([])
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const pageSize = 100;
    const [sortOptions, setSortOptions] = useState<any>({});
    const [filterOptions, setFilterOptions] = useState<any>({});
    const [paginationModel, setPaginationModel] = useState<any>({});

    // For Alert
    const [open, setOpen] = React.useState(false);
    const [secondsCounter, setSecondsCounter] = useState(0);
    const [alertSeverity, setAlertSeverity] = useState<AlertColor>("warning");
    const [alertMessage, setAlertMessage] = useState<string>("")

    // Some API clients return undefined while loading
    // Following lines are here to prevent `rowCountState` from being undefined during the loading
    const [rowCountState, setRowCountState] = React.useState(
        totalRowCount || 0,
    );
    useEffect(() => {
        setRowCountState((prevRowCountState: any) =>
            totalRowCount !== undefined
                ? totalRowCount
                : prevRowCountState,
        );
    }, [totalRowCount, setRowCountState]);

    // Get the total number of documents in the collection
    const getCollectionCount = async () => {
        try {
            const collectionCount = await GET_COLLECTION_COUNT(insightsData.collectionName);
            setTotalRowCount(collectionCount.count);
        } catch (error) {
            console.error(error);
        }
    };

    function getColumnTypeByField(field: string) {
        const column: any = columnDefinition.find((column: any) => (column.field === field));
        if (column !== undefined && column !== null) {
            return column.type
        } else {
            return undefined
        }
    }

    // Get the column definition (names of the columns)
    const getCollDef = async () => {
        try {
            const columnDefinition = await GET_COLLECTION_COLUMN_DEF(insightsData.collectionName);
            // Add appropiate valueGetter functions (for columns whose type is not string)
            const updatedColumnDefinition = columnDefinition.map((item: any) => {
                // Case: Date & DateTime
                if (item.type === "date" || item.type === "datetime") {
                    item = {
                        ...item,
                        valueGetter: ({ value }: { value: any }) => (value ? new Date(value) : null),
                        filterOperators: getGridDateOperators().filter(
                            (operator) => !["isEmpty", "isNotEmpty", "isAnyOf"].includes(operator.value)
                        ),
                    };
                }

                // Case: Text
                if (item.type === "text") {
                    item = {
                        ...item,
                        filterOperators: getGridStringOperators().filter(
                            (operator) => !["isEmpty", "isNotEmpty", "isAnyOf", "endsWith"].includes(operator.value)
                        ),
                        renderCell: (params: GridRenderCellParams) => <ExpandableCell {...params} />,
                    }
                }

                // Case: Number
                if (item.type === "number") {
                    item = {
                        ...item,
                        filterOperators: getGridNumericOperators().filter(
                            (operator) => !["isEmpty", "isNotEmpty", "isAnyOf"].includes(operator.value)
                        ),
                    }
                }

                // All columns
                item = {
                    ...item,
                    headerAlign: 'center',
                    align: 'center',
                    renderHeader: (params: GridColumnHeaderParams) => (
                        <strong>
                            {params.field}
                        </strong>
                    ),
                }

                return item;
            });

            setColumnDefinition(updatedColumnDefinition);
        } catch (error) {
            console.error(error);
        }
    };

    // Whenever the user clicks a new collection, update the column definition and row count
    useEffect(() => {
        if (insightsData.collectionName) {
            getCollectionCount();
            getCollDef();
            setPaginationModel({
                page: 0,
                pageSize: pageSize
            });
        }

    }, [insightsData.collectionName])

    // Get the documents for the currently displayed page
    useEffect(() => {
        const loadRows = () => {
            const page = paginationModel.page;
            const pageSize = paginationModel.pageSize;
            const sortKey = sortOptions.length > 0 ? sortOptions[0].field : null;
            const sortDirection = sortOptions.length > 0 ? sortOptions[0].sort : 0;
            const filterField = filterOptions.items && Object.keys(filterOptions.items).length !== 0 ? filterOptions.items[0].field : null
            const filterOperator = filterOptions.items && Object.keys(filterOptions.items).length !== 0 ? filterOptions.items[0].operator : null
            const filterValue = filterOptions.items && Object.keys(filterOptions.items).length !== 0 ? filterOptions.items[0].value : null
            const filterColType = getColumnTypeByField(filterField);
            setIsLoading(true);

            // Load new rows
            const getPageCollections = async () => {
                try {
                    setIsLoading(true);
                    const collections = await GET_PAGE_COLLECTIONS(
                        insightsData.collectionName,
                        page,
                        pageSize,
                        sortKey,
                        sortDirection,
                        filterField,
                        filterOperator,
                        filterValue,
                        filterColType
                    );
                    setRows(collections);
                    setIsLoading(false);
                } catch (error) {
                    // TODO Error Message: "There was an error loading the data for the collection."
                    console.error(error);
                }
            };
            getPageCollections();
        }

        if (Object.keys(paginationModel).length > 0) {
            if (insightsData.collectionName) {
                loadRows();
            }
        }
    }, [paginationModel, sortOptions, filterOptions])

    const handlePaginationModelChange = React.useCallback((paginationModel: any) => {
        setPaginationModel(paginationModel);
    }, []);

    const handleSortModelChange = React.useCallback((sortModel: GridSortModel) => {
        setSortOptions(sortModel);
    }, []);

    const onFilterChange = React.useCallback((filterModel: GridFilterModel) => {
        setFilterOptions(filterModel);
    }, []);

    let alertTimeout: any;

    useEffect(() => {
        // Display Alert to warn user about loading times after 5 seconds
        if (isLoading) {
            setAlertSeverity("warning");
            setAlertMessage("Please hold on - Loading can take up to 90 seconds for large collections ...");
            alertTimeout = setTimeout(() => {
                setOpen(true);
            }, 5000);
        } else {
            // Cancel the alert if isLoading becomes false before 5 seconds
            clearTimeout(alertTimeout);
            setAlertSeverity("success");
            setAlertMessage("Done");
            setTimeout(() => {
                setOpen(false);
            }, 5000);
        }

        // Cleanup function to cancel the alert if the component unmounts
        return () => clearTimeout(alertTimeout);
    }, [isLoading]);

    useEffect(() => {
        // Update the seconds counter every second when isLoading is true
        let interval: any;
        if (isLoading) {
            interval = setInterval(() => {
                setSecondsCounter((prevCounter) => prevCounter + 1);
            }, 1000);
        }

        // Cleanup function to stop updating the counter when isLoading is false
        setTimeout(() => {
            setSecondsCounter(0);
        }, 1000)
        return () => clearInterval(interval);
    }, [isLoading]);


    return (
        <>

            <div style={{ height: 400, width: '100%' }}>
                {insightsData.collectionName ? (
                    <>
                        <div style={{ "marginBottom": "1em" }}>
                            <Divider>
                                <Chip
                                    icon={<DocumentScannerIcon />}
                                    label={insightsData.collectionName}
                                    className="documentLabel"
                                />
                            </Divider>
                        </div>
                        <Collapse in={open}>
                            <Alert
                                severity={alertSeverity}
                            >
                                {alertMessage} {alertSeverity === "warning" &&
                                    "(" + secondsCounter + " sec.)"
                                }
                            </Alert>
                        </Collapse>
                        <DataGrid
                            rows={rows}
                            columns={columnDefinition}
                            loading={isLoading}
                            rowCount={rowCountState}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: pageSize,
                                    },
                                },
                            }}
                            showCellVerticalBorder={true}
                            showColumnVerticalBorder={true}
                            slots={{
                                loadingOverlay: LinearProgress,
                                toolbar: GridToolbar,
                                noRowsOverlay: CustomNoRowsOverlay,
                            }}
                            getEstimatedRowHeight={() => 100}
                            getRowHeight={() => 'auto'}
                            sx={{
                                [`& .${gridClasses.cell}`]: {
                                    py: 1,
                                },
                                backgroundColor: 'white',
                                boxShadow: 0,
                                border: 0,
                                borderRadius: 0,
                                marginBottom: '6em',
                                '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': {
                                    py: 1,
                                },
                                '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {
                                    py: '15px',
                                },
                                '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {
                                    py: '22px',
                                },
                            }}
                            pageSizeOptions={[5, 10, 20, 50, 100]}
                            checkboxSelection={false}
                            disableRowSelectionOnClick
                            paginationMode="server"
                            onPaginationModelChange={handlePaginationModelChange}
                            sortingMode="server"
                            onSortModelChange={handleSortModelChange}
                            filterMode="server"
                            onFilterModelChange={onFilterChange}
                        />
                    </>
                ) : (
                    <div>Please select a collection to analyze first.</div>
                )
                }
            </div>
        </>
    );
};

export default CollectionGrid;
