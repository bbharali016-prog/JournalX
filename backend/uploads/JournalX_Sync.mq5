//+------------------------------------------------------------------+
//|                                                JournalX_Sync.mq5 |
//|                                  Copyright 2026, JournalX Team.  |
//|                                         https://journalx.app     |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, JournalX Team."
#property link      "https://journalx.app"
#property version   "1.00"
#property description "Expert Advisor to automatically synchronize closed trades with JournalX."
#property strict

//--- input parameters
input string   InpApiKey       = "";                  // JournalX MT5 API Key
input string   InpServerUrl    = "http://127.0.0.1:8000"; // JournalX Server URL (e.g., http://localhost:8000)
input int      InpTimerSeconds = 10;                  // Sync Interval in Seconds

//--- global variables
datetime last_sync_time = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   if(StringLen(InpApiKey) == 0)
   {
      Alert("JournalX Sync Error: API Key is empty! Please set it in inputs.");
      return(INIT_PARAMETERS_INCORRECT);
   }
   
   // Set timer
   EventSetTimer(InpTimerSeconds);
   
   // Perform initial sync
   SyncTrades();
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
}

//+------------------------------------------------------------------+
//| Expert timer function                                            |
//+------------------------------------------------------------------+
void OnTimer()
{
   SyncTrades();
}

//+------------------------------------------------------------------+
//| Helper to find the entry price of a position                    |
//+------------------------------------------------------------------+
double GetPositionEntryPrice(ulong position_id)
{
   int total = HistoryDealsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket > 0)
      {
         if(HistoryDealGetInteger(ticket, DEAL_POSITION_ID) == position_id &&
            HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_IN)
         {
            return(HistoryDealGetDouble(ticket, DEAL_PRICE));
         }
      }
   }
   return(0.0);
}

//+------------------------------------------------------------------+
//| Helper to get the side (BUY/SELL) of a position                  |
//+------------------------------------------------------------------+
string GetPositionSide(ulong position_id)
{
   int total = HistoryDealsTotal();
   for(int i = 0; i < total; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket > 0)
      {
         if(HistoryDealGetInteger(ticket, DEAL_POSITION_ID) == position_id &&
            HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_IN)
         {
            long type = HistoryDealGetInteger(ticket, DEAL_TYPE);
            if(type == DEAL_TYPE_BUY)  return("BUY");
            if(type == DEAL_TYPE_SELL) return("SELL");
         }
      }
   }
   return("BUY");
}

//+------------------------------------------------------------------+
//| Synchronize trades with backend                                  |
//+------------------------------------------------------------------+
void SyncTrades()
{
   // Select history up to now
   if(!HistorySelect(0, TimeCurrent()))
   {
      Print("JournalX Sync: Failed to select history.");
      return;
   }
   
   int total_deals = HistoryDealsTotal();
   string json_trades = "";
   int count = 0;
   
   long account_id = AccountInfoInteger(ACCOUNT_LOGIN);
   string account_str = IntegerToString(account_id);
   
   for(int i = 0; i < total_deals; i++)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket <= 0) continue;
      
      // We look for exit deals (DEAL_ENTRY_OUT)
      long entry_type = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if(entry_type == DEAL_ENTRY_OUT || entry_type == DEAL_ENTRY_OUT_BY || entry_type == DEAL_ENTRY_INOUT)
      {
         ulong position_id = HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
         double entry_price = GetPositionEntryPrice(position_id);
         string side = GetPositionSide(position_id);
         
         string symbol = HistoryDealGetString(ticket, DEAL_SYMBOL);
         double volume = HistoryDealGetDouble(ticket, DEAL_VOLUME);
         double exit_price = HistoryDealGetDouble(ticket, DEAL_PRICE);
         double profit = HistoryDealGetDouble(ticket, DEAL_PROFIT);
         double commission = HistoryDealGetDouble(ticket, DEAL_COMMISSION);
         double swap = HistoryDealGetDouble(ticket, DEAL_SWAP);
         datetime deal_time = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
         
         // Net profit including commission and swap
         double net_profit = profit + commission + swap;
         
         // Format JSON for this trade
         string trade_json = "{" +
            "\"ticket\":\"" + IntegerToString(ticket) + "\"," +
            "\"symbol\":\"" + symbol + "\"," +
            "\"side\":\"" + side + "\"," +
            "\"lot_size\":" + DoubleToString(volume, 2) + "," +
            "\"entry_price\":" + DoubleToString(entry_price, 5) + "," +
            "\"exit_price\":" + DoubleToString(exit_price, 5) + "," +
            "\"profit\":" + DoubleToString(net_profit, 2) + "," +
            "\"created_at\":" + IntegerToString(deal_time) + "," +
            "\"notes\":\"Synced from MT5 Account " + account_str + "\"," +
            "\"mt5_account\":\"" + account_str + "\"" +
         "}";
         
         if(count > 0) json_trades += ",";
         json_trades += trade_json;
         count++;
      }
   }
   
   if(count == 0)
   {
      return; // No closed trades in history
   }
   
   // Wrap trades in outer object
   string payload = "{\"trades\":[" + json_trades + "]}";
   
   // Send WebRequest
   char post_data[];
   char result[];
   string result_headers;
   
   StringToCharArray(payload, post_data, 0, StringLen(payload));
   
   string url = InpServerUrl + "/api/v1/mt5/sync";
   string headers = "Content-Type: application/json\r\n" +
                    "X-MT5-API-Key: " + InpApiKey + "\r\n";
   
   ResetLastError();
   int res = WebRequest("POST", url, headers, 5000, post_data, result, result_headers);
   
   if(res == 200 || res == 201)
   {
      string response = CharArrayToString(result);
      Print("JournalX Sync Success: " + response);
   }
   else
   {
      if(res == -1)
      {
         Print("JournalX WebRequest Error. Check Options -> Expert Advisors -> Allow WebRequest for listed URL. Make sure you added: " + InpServerUrl);
      }
      else
      {
         Print("JournalX Sync Failed. HTTP Code: " + IntegerToString(res) + ", Response: " + CharArrayToString(result));
      }
   }
}
//+------------------------------------------------------------------+
