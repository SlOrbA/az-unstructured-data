variable "tags" { 
    default = {
        deployer = "first.last@email.net"
        example  = "example" 
    }
}

provider "azurerm" {
    features {}
}

resource "random_integer" "postfix" {
  min = 1
  max = 9999
}

resource "azurerm_resource_group" "example" {
  name     = "example-${random_integer.postfix.result}"
  location = "West Europe"
  tags = var.tags
}

resource "azurerm_eventhub_namespace" "example" {
  name                = "exampleEventHubNamespace${random_integer.postfix.result}"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  sku                 = "Basic"
  capacity            = 1

  tags = var.tags
}

resource "azurerm_eventhub" "endpoint" {
  name                = "endpoint"
  namespace_name      = azurerm_eventhub_namespace.example.name
  resource_group_name = azurerm_resource_group.example.name
  partition_count     = 2
  message_retention   = 1
}

resource "azurerm_eventhub_authorization_rule" "endpoint" {
  name                = "endpoint"
  namespace_name      = azurerm_eventhub_namespace.example.name
  eventhub_name       = azurerm_eventhub.endpoint.name
  resource_group_name = azurerm_resource_group.example.name
  listen              = true
  send                = false
  manage              = false
}

resource "azurerm_eventhub" "first" {
  name                = "first"
  namespace_name      = azurerm_eventhub_namespace.example.name
  resource_group_name = azurerm_resource_group.example.name
  partition_count     = 2
  message_retention   = 1
}

resource "azurerm_eventhub" "second" {
  name                = "second"
  namespace_name      = azurerm_eventhub_namespace.example.name
  resource_group_name = azurerm_resource_group.example.name
  partition_count     = 2
  message_retention   = 1
}

resource "azurerm_storage_account" "example" {
  name                     = "exmpfunc${random_integer.postfix.result}"
  resource_group_name      = azurerm_resource_group.example.name
  location                 = azurerm_resource_group.example.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags = var.tags
}

resource "azurerm_app_service_plan" "example" {
  name                = "azure-functions-test-service-plan-${random_integer.postfix.result}"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name

  sku {
    tier = "Standard"
    size = "S1"
  }

  tags = var.tags
}

resource "azurerm_application_insights" "example" {
  name                = "example-appinsights-${random_integer.postfix.result}"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  application_type    = "web"
}

resource "azurerm_function_app" "example" {
  name                       = "example-functions-${random_integer.postfix.result}"
  location                   = azurerm_resource_group.example.location
  resource_group_name        = azurerm_resource_group.example.name
  app_service_plan_id        = azurerm_app_service_plan.example.id
  storage_account_name       = azurerm_storage_account.example.name
  storage_account_access_key = azurerm_storage_account.example.primary_access_key
  version                    = "~3"

  app_settings = {
      "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.example.instrumentation_key
      "ENDPOINT_EVENT_HUB_CONNECTION"= azurerm_eventhub_authorization_rule.endpoint.primary_connection_string
  }

  tags = var.tags
}

resource "null_resource" "example-functions" {
    provisioner "local-exec" {
        working_dir = "../functions"
        command     = "yarn build;func azure functionapp publish ${azurerm_function_app.example.name}"
  }
}
