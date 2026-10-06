import {test} from "node:test";
import assert from "node:assert/strict";
import {getTablePagination} from "./table-pagination";
test("empty tables show a zero range with navigation on the first page",()=>{const state=getTablePagination(0,4,10);assert.equal(state.start,0);assert.equal(state.end,0);assert.equal(state.page,1);assert.equal(state.totalPages,1);});
test("last pages and removed records clamp the selected page and visible range",()=>{const state=getTablePagination(23,9,10);assert.equal(state.page,3);assert.equal(state.start,21);assert.equal(state.end,23);assert.equal(getTablePagination(9,3,10).page,1);});
test("page-size changes calculate a consistent range",()=>{const state=getTablePagination(51,2,20);assert.equal(state.startIndex,20);assert.equal(state.endIndex,40);assert.equal(state.totalPages,3);});
