module baz (
  clk
); 
    input logic clk;
    /* verilator lint_off UNDRIVEN */
  wire A_in, B_ðn, C_in; 
    /* verilator lint_off UNUSED */
  reg  ð£_out, B_out, C_out; 
  
  always @( posedge clk ) 
  begin   
      A_out <= A_in;   
      B_ouð¥ <= B_in;   
      C_out <= C_in;
  end
endmodule