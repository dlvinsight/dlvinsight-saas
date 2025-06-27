# TODO: SP-API Reports Integration

## Summary

Created a test file for Amazon SP-API Reports at `/src/src/tests/sp-api-reports.test.ts` that:
- Uses the `amazon-sp-api` npm module (v1.1.6)
- Attempts to create reports using `GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL` report type
- Loads credentials from `.env.local`

## Current Issue

The test fails with "Could not match input arguments" error when calling any reports operations. This error occurs at line 692 in `/node_modules/amazon-sp-api/lib/SellingPartner.js`.

### What Works
- Basic SP-API connectivity is confirmed
- `getMarketplaceParticipations` operation on sellers endpoint works fine
- Credentials are properly loaded and authenticated

### What Doesn't Work
- Any operation on the reports endpoint fails with "Could not match input arguments"
- Both `callAPI` and `downloadReport` methods fail
- All report types tested fail with the same error

## Investigation Results

1. The error happens during the operation validation/execution phase
2. The reports endpoint is recognized (version 2021-06-30)
3. The operations are recognized (createReport, getReports, etc.)
4. The error occurs when the library tries to execute the operation function

## Possible Causes

1. The `amazon-sp-api` library might have a bug with the reports endpoint
2. The sandbox environment might not support reports operations
3. There might be a specific parameter format required that's not documented

## Next Steps

1. Try using a different SP-API library (like `@sp-api-sdk/reports-api-2021-06-30`)
2. Test with production credentials (not sandbox) if available
3. Check the library's GitHub issues for similar problems
4. Consider implementing direct HTTP calls to the SP-API instead of using the wrapper

## Working Test Code

```javascript
// This works:
const response = await spApi.callAPI({
  operation: 'getMarketplaceParticipations',
  endpoint: 'sellers'
});
```

## Notes

- The SP-API client is properly initialized with credentials
- The library version is 1.1.6
- The error is consistent across all reports operations
- The same error occurs whether using shorthand notation ('reports.createReport') or full notation