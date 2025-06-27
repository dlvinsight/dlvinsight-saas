# TODO: SP-API Reports Integration

## Summary

Created a test file for Amazon SP-API Reports at `/src/src/tests/sp-api-reports.test.ts` that:
- Uses the `amazon-sp-api` npm module (v1.1.6)
- Attempts to create reports using `GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL` report type
- Loads credentials from `.env.local`

## Current Issue

The test fails with "Could not match input arguments" error when calling:
```javascript
spApi.callAPI({
  operation: 'createReport',
  endpoint: 'reports',
  body: { reportType, marketplaceIds, dataStartTime, dataEndTime }
})
```

## Next Steps

1. Debug why the `callAPI` method isn't accepting the arguments
2. Consider using the `downloadReport()` wrapper method instead
3. Check if sandbox environment supports this specific report type
4. Verify the exact API call format expected by the `amazon-sp-api` library

## Notes

- The SP-API client is properly initialized with credentials
- The operation call format needs adjustment
- The `createReport` operation exists in the library at `/node_modules/amazon-sp-api/lib/resources/versions/reports/reports_2021-06-30.js`