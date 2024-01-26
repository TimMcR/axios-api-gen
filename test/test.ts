import {codegen} from "../src/codegen";
import swagger from "./example-swagger.json";

codegen({
  outputDirectory: "./test/",
  source: swagger,
});
