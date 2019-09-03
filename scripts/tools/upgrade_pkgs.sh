#!/bin/bash
set -ex

ncu -u
 
(cd ./packages/vtw-core && ncu -u)
(cd ./packages/vtw-bootstrap && ncu -u)
(cd ./packages/vtw-host-app && ncu -u)
(cd ./packages/vtw-mobx-app && ncu -u)
