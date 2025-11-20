import Link from "next/link";
import { useRouter } from "next/router";
import { ParsedUrlQueryInput } from "querystring";
import { BiAnalyse } from "react-icons/bi";
import { IoBarcodeSharp } from "react-icons/io5";
import { Spacer } from "../ui/spacer";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Toolbar } from "../ui/toolbar";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCurrentOrganization } from "@/hooks/use-current-organization";

export const OperationsToolbar: React.FC<{
  tab: 'metrics' | 'clients';
  children?: React.ReactNode;
}> = (props) => {
  const router = useRouter();
  const { namespace: { name: namespace } } = useWorkspace();
  const organizationSlug = useCurrentOrganization()?.slug;

  const query: ParsedUrlQueryInput = {
    organizationSlug,
    namespace,
    slug: router.query.slug,
    operationId: router.query.operationId,
  };

  if (router.query.filterState) {
    query.filterState = router.query.filterState;
  }

  if (router.query.range) {
    query.range = router.query.range;
  }

  if (router.query.dateRange) {
    query.dateRange = router.query.dateRange;
  }

  return (
    <Toolbar>
      <Tabs value={props.tab} className="w-full md:w-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics" asChild>
            <Link
              href={{
                pathname:
                  "/[organizationSlug]/[namespace]/graph/[slug]/operations/[operationId]",
                query,
              }}
              className="flex gap-x-2"
            >
              <BiAnalyse />
              Metrics
            </Link>
          </TabsTrigger>
          <TabsTrigger value="clients" asChild>
            <Link
              href={{
                pathname:
                  "/[organizationSlug]/[namespace]/graph/[slug]/operations/[operationId]/clients",
                query,
              }}
              className="flex gap-x-2"
            >
              <IoBarcodeSharp size="18px" />
              Clients
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Spacer />
      {props.children}
    </Toolbar>
  );
};
